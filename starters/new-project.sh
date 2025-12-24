# ... (previous code)

  1)
    # Internal Funnelists project for Antigravity
    read -p "Project name: " name
    cd ~/Development/funnelists
    bash ~/Development/agi-framework/setup-new-project.sh "$name"
    
    # Add comprehensive Antigravity config with multi-LLM support
    cat > "$name/antigravity.config.json" << EOF
{
  "projectName": "$name",
  "framework": {
    "path": "./framework",
    "enabled": true
  },
  "ai": {
    "providers": {
      "anthropic": {
        "enabled": true,
        "models": ["claude-opus-4", "claude-sonnet-4", "claude-haiku-4"],
        "defaultModel": "claude-sonnet-4",
        "apiKeyEnv": "REACT_APP_ANTHROPIC_API_KEY",
        "useCases": ["reasoning", "code-generation", "analysis"]
      },
      "openai": {
        "enabled": false,
        "models": ["gpt-4", "gpt-4-turbo"],
        "defaultModel": "gpt-4",
        "apiKeyEnv": "REACT_APP_OPENAI_API_KEY",
        "useCases": ["embeddings", "backup"]
      },
      "local": {
        "enabled": false,
        "endpoint": "http://localhost:11434",
        "models": ["llama2", "mistral"],
        "defaultModel": "llama2",
        "useCases": ["development", "testing"]
      }
    },
    "routing": {
      "strategy": "cost-optimized",
      "rules": {
        "simple-queries": "claude-haiku-4",
        "complex-reasoning": "claude-opus-4",
        "general": "claude-sonnet-4"
      },
      "fallback": {
        "enabled": true,
        "order": ["anthropic", "openai", "local"]
      }
    }
  }
}
EOF
    
    echo "✅ Created: ~/Development/funnelists/$name"
    echo "📝 Multi-LLM support configured (Anthropic enabled by default)"
    echo "   Edit antigravity.config.json to enable other providers"
    echo ""
    echo "Open in Antigravity IDE or: code ~/Development/funnelists/$name"
    ;;