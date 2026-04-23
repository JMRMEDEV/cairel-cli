---
name: go-style-conventions
description: Idiomatic Go style, formatting, naming, and error handling conventions. Use when writing or reviewing Go code. Covers gofmt, export visibility, error wrapping, project structure, context usage, and table-driven tests.
metadata:
  cairel-title: "Go Style & Best Practices"
  cairel-category: golang
  cairel-version: "1.0.0"
  cairel-tags:
    - go
    - golang
    - formatting
    - style
    - conventions
    - idiomatic
  cairel-conditions:
    languages:
      - go
---

# Go Style & Best Practices

**Purpose**: Enforce idiomatic Go conventions for formatting, naming, error handling, and project structure.

**Applies To**: All Go projects

---

## 🚨 Critical Rules

### 1. Formatting is Non-Negotiable

**ALL Go code MUST be `gofmt`-formatted.**

```bash
gofmt -w .
goimports -w .
```

### 2. Export Visibility Rules (Capitalization)

| Scope | Style | Example |
|-------|-------|---------|
| Exported (public) | `PascalCase` | `Server`, `NewClient`, `ErrNotFound` |
| Unexported (private) | `camelCase` | `server`, `newClient`, `errNotFound` |

**Acronyms**: `HTTPServer`, `userID`, `parseJSON` (not `HttpServer`, `userId`)

### 3. Error Handling

**Never ignore errors. Always handle or explicitly document why.**

```go
// ✅ Correct
if err != nil {
    return fmt.Errorf("open config: %w", err)
}

// ❌ Wrong
data, _ := os.ReadFile("config.json")
```

**Error messages**: lowercase, no punctuation, context-free.

---

## 📋 Standard Rules

### Project Structure

```
project/
├── cmd/            # entrypoints (main packages)
├── internal/       # private application code
├── pkg/            # reusable public packages (optional)
├── go.mod
└── go.sum
```

Avoid `utils/` or `helpers/` packages.

### Context & Concurrency

- `context.Context` is the **first parameter**
- Never store context in structs
- Use `errgroup` for goroutine coordination

### Documentation

Exported identifiers MUST have godoc comments starting with the identifier name.

---

## ✅ Checklist

- [ ] `gofmt -w .` produces no changes
- [ ] `goimports -w .` organizes imports
- [ ] All exported identifiers have godoc comments
- [ ] No unused imports or variables
- [ ] All errors handled with context wrapping (`%w`)
- [ ] `go vet ./...` with no warnings
- [ ] Tests present for core logic (`*_test.go`)
