-- Enable pgvector extension for vector embeddings
create extension if not exists vector;

-- =============================================================================
-- EPISODIC MEMORY - Conversation History
-- =============================================================================

create table episodic_memory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  agent_id text not null,
  task_id text,
  
  -- Content
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  tokens_used integer,
  cost_usd numeric(10, 6),
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index episodic_memory_user_id_idx on episodic_memory(user_id);
create index episodic_memory_session_id_idx on episodic_memory(session_id);
create index episodic_memory_agent_id_idx on episodic_memory(agent_id);
create index episodic_memory_created_at_idx on episodic_memory(created_at desc);

-- Row Level Security
alter table episodic_memory enable row level security;

create policy "Users can view their own memory"
  on episodic_memory for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memory"
  on episodic_memory for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- SEMANTIC MEMORY - Vector Embeddings
-- =============================================================================

create table semantic_memory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Content
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 dimension
  
  -- Metadata
  source text,
  metadata jsonb default '{}'::jsonb,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vector similarity search index
create index semantic_memory_embedding_idx on semantic_memory 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index semantic_memory_user_id_idx on semantic_memory(user_id);

-- Row Level Security
alter table semantic_memory enable row level security;

create policy "Users can view their own semantic memory"
  on semantic_memory for select
  using (auth.uid() = user_id);

create policy "Users can insert their own semantic memory"
  on semantic_memory for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- AGENT EXECUTIONS - Track agent runs
-- =============================================================================

create table agent_executions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Agent info
  agent_id text not null,
  agent_type text not null,
  
  -- Task info
  task_id text not null,
  task_description text not null,
  
  -- Execution details
  status text not null check (status in ('pending', 'running', 'completed', 'failed')),
  result jsonb,
  error_message text,
  
  -- Performance metrics
  duration_ms integer,
  tokens_used integer,
  cost_usd numeric(10, 6),
  
  -- Timestamps
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Indexes
create index agent_executions_user_id_idx on agent_executions(user_id);
create index agent_executions_agent_id_idx on agent_executions(agent_id);
create index agent_executions_status_idx on agent_executions(status);
create index agent_executions_started_at_idx on agent_executions(started_at desc);

-- Row Level Security
alter table agent_executions enable row level security;

create policy "Users can view their own executions"
  on agent_executions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own executions"
  on agent_executions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own executions"
  on agent_executions for update
  using (auth.uid() = user_id);

-- =============================================================================
-- COST TRACKING - Monitor API usage
-- =============================================================================

create table cost_tracking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Provider info
  provider text not null,
  model text not null,
  
  -- Usage
  tokens_input integer not null,
  tokens_output integer not null,
  tokens_total integer not null,
  cost_usd numeric(10, 6) not null,
  
  -- Context
  agent_id text,
  task_id text,
  session_id text,
  
  -- Timestamp
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index cost_tracking_user_id_idx on cost_tracking(user_id);
create index cost_tracking_provider_idx on cost_tracking(provider);
create index cost_tracking_created_at_idx on cost_tracking(created_at desc);

-- Row Level Security
alter table cost_tracking enable row level security;

create policy "Users can view their own costs"
  on cost_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert their own costs"
  on cost_tracking for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to search semantic memory by similarity
create or replace function match_semantic_memory(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
language sql stable
as $$
  select
    semantic_memory.id,
    semantic_memory.content,
    1 - (semantic_memory.embedding <=> query_embedding) as similarity,
    semantic_memory.metadata
  from semantic_memory
  where 
    (filter_user_id is null or semantic_memory.user_id = filter_user_id)
    and 1 - (semantic_memory.embedding <=> query_embedding) > match_threshold
  order by semantic_memory.embedding <=> query_embedding
  limit match_count;
$$;