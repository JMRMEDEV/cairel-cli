---
meta:
  id: "go-style-conventions"
  title: "Go Style & Best Practices"
  author: "cairel-core"
  version: "1.0.0"
  category: "golang"
  tags: ["go", "golang", "formatting", "style", "conventions", "idiomatic"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-23"
  description: "Idiomatic Go style, formatting, naming, and error handling conventions"
  conditions:
    languages:
      - go
---

# Go Style & Best Practices

**Purpose**: Enforce idiomatic Go conventions for formatting, naming, error handling, and project structure following community standards

**Applies To**: All Go projects

---

## 🚨 Critical Rules

### 1. Formatting is Non-Negotiable

**ALL Go code MUST be `gofmt`-formatted before any commit or file save.**

```bash
# Required before every commit
gofmt -w .
goimports -w .
```

- Never hand-format Go code
- Formatting differences are considered bugs
- CI MUST fail if files are not `gofmt`-clean
- Use `goimports` to automatically manage imports

**AI Requirement**: After modifying ANY Go file, you MUST run `gofmt -w <file>` and verify the output.

---

### 2. Export Visibility Rules (Capitalization)

Go uses **capitalization for visibility** - there are NO access modifiers.

| Scope                | Style        | Example                              |
| -------------------- | ------------ | ------------------------------------ |
| Exported (public)    | `PascalCase` | `Server`, `NewClient`, `ErrNotFound` |
| Unexported (private) | `camelCase`  | `server`, `newClient`, `errNotFound` |

**Critical**: This is NOT a style preference - it's how Go determines what's accessible outside the package.

**Acronyms/Initialisms**: Use standard Go casing
```go
// ✅ Correct
HTTPServer
userID
parseJSON

// ❌ Wrong
HttpServer
userId
parseJson
```

---

### 3. Error Handling

**Never ignore errors. Always handle or explicitly document why you're ignoring.**

```go
// ✅ Correct - wrap with context
if err != nil {
    return fmt.Errorf("open config: %w", err)
}

// ❌ Wrong - ignored error
data, _ := os.ReadFile("config.json")
```

**Error Message Rules**:
- Lowercase (no capital first letter)
- No punctuation at the end
- Context-free (should read naturally when wrapped)

```go
// ✅ Correct
var ErrNotFound = errors.New("not found")
return fmt.Errorf("parse user: %w", err)

// ❌ Wrong
var ErrNotFound = errors.New("Not found.")
return fmt.Errorf("Parse user: %w", err)
```

---

## 📋 Standard Rules

### Naming Conventions

**Variables & Functions**:
```go
var maxRetries int
var userID string

func parseURL(raw string) (*url.URL, error)
```

- Short names preferred when scope is small (`i`, `n`, `err`)
- Avoid unnecessary prefixes (`util`, `helper`, `base`)
- No underscores in names (except test functions)

**Types & Structs**:
```go
type Server struct {
    Addr string
    Port int
}
```

- No `I` prefixes for interfaces
- No `Class` or `Type` suffixes
- Struct fields follow same export rules

**Interfaces**:
- Prefer small, single-purpose interfaces
- Name by behavior (often `-er` suffix)
- Define interfaces where consumed, not where implemented

```go
type Reader interface {
    Read(p []byte) (int, error)
}

type Closer interface {
    Close() error
}
```

---

### Project Structure

**Standard Layout**:
```text
project/
├── cmd/            # entrypoints (main packages)
│   └── app/
│       └── main.go
├── internal/       # private application code
│   ├── service/
│   └── repository/
├── pkg/            # reusable public packages (optional)
├── go.mod
├── go.sum
└── README.md
```

**Avoid**:
- `utils/` or `helpers/` packages
- Deeply nested package hierarchies
- Circular dependencies

---

### Context & Concurrency

**Context Usage**:
```go
func (s *Server) Serve(ctx context.Context) error
```

Rules:
- `context.Context` is usually the **first parameter**
- Never store context in structs
- Always pass context explicitly

**Goroutines**:
- Goroutines must have a clear owner
- Avoid unbounded goroutine creation
- Use channels or `errgroup` for coordination
- Always handle goroutine cleanup

```go
// ✅ Correct - bounded with errgroup
g, ctx := errgroup.WithContext(ctx)
for _, item := range items {
    item := item // capture loop variable
    g.Go(func() error {
        return process(ctx, item)
    })
}
return g.Wait()
```

---

### Documentation

**Godoc Comments** - Exported identifiers MUST have comments:

```go
// Server handles HTTP requests and manages connections.
// It implements graceful shutdown and request timeouts.
type Server struct {
    Addr string
}

// NewServer creates a new Server with the given address.
func NewServer(addr string) *Server {
    return &Server{Addr: addr}
}
```

Rules:
- Full sentence starting with the identifier name
- Explains *why* and *what*, not *how*
- No redundant comments (don't just repeat the code)

---

## ✅ Checklist

Before considering Go code complete:

- [ ] Run `gofmt -w .` and verify no changes
- [ ] Run `goimports -w .` to organize imports
- [ ] All exported identifiers have godoc comments
- [ ] No unused imports or variables
- [ ] Error handling present for all error returns
- [ ] Errors wrapped with context using `%w`
- [ ] Naming follows export capitalization rules
- [ ] No `utils/` or `helpers/` packages
- [ ] Tests present for core logic (`*_test.go`)
- [ ] Run `go vet ./...` with no warnings
- [ ] Run `golangci-lint run` (if configured)

---

## 🔍 Examples

### Good: Idiomatic Error Handling

```go
func LoadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("read config file: %w", err)
    }
    
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parse config: %w", err)
    }
    
    return &cfg, nil
}
```

### Bad: Ignored Errors and Poor Naming

```go
func load_config(Path string) *Config {
    Data, _ := os.ReadFile(Path) // ❌ Ignored error
    var Cfg Config               // ❌ Wrong capitalization
    json.Unmarshal(Data, &Cfg)   // ❌ Ignored error
    return &Cfg
}
```

---

### Good: Table-Driven Tests

```go
func TestParseURL(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    string
        wantErr bool
    }{
        {
            name:  "valid http url",
            input: "http://example.com",
            want:  "example.com",
        },
        {
            name:    "invalid url",
            input:   "://invalid",
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseURL(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("ParseURL() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if got != tt.want {
                t.Errorf("ParseURL() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

---

## 🚫 Common Mistakes

### 1. Ignoring Errors

```go
// ❌ Wrong
data, _ := os.ReadFile("config.json")

// ✅ Correct
data, err := os.ReadFile("config.json")
if err != nil {
    return fmt.Errorf("read config: %w", err)
}
```

---

### 2. Wrong Capitalization

```go
// ❌ Wrong - breaks visibility
type server struct { // unexported when it should be public
    Addr string
}

// ✅ Correct
type Server struct {
    Addr string
}
```

---

### 3. Storing Context in Structs

```go
// ❌ Wrong
type Handler struct {
    ctx context.Context // never store context
}

// ✅ Correct
type Handler struct {
    db *sql.DB
}

func (h *Handler) Handle(ctx context.Context, req Request) error {
    // pass context as parameter
}
```

---

### 4. Manual Formatting

```go
// ❌ Wrong - hand-formatted
func process(x int,y int,z int) error{
return nil
}

// ✅ Correct - gofmt formatted
func process(x int, y int, z int) error {
    return nil
}
```

---

## 🤖 AI Self-Check Protocol

### Before Saving Any Go File

```
1. Did I run `gofmt -w <file>`?
   └─ If NO → STOP and run it now
   
2. Are all exported identifiers capitalized correctly?
   └─ Public: PascalCase
   └─ Private: camelCase
   
3. Are all errors handled or explicitly ignored with comment?
   └─ If ignored → Add comment explaining why
   
4. Are error messages lowercase with no punctuation?
   └─ If NO → Fix error messages
   
5. Are imports organized (no unused imports)?
   └─ Run `goimports -w <file>`
   
6. Do all exported items have godoc comments?
   └─ If NO → Add comments starting with identifier name
```

### Before Committing

```
1. Run: gofmt -w .
2. Run: goimports -w .
3. Run: go vet ./...
4. Run: go test ./...
5. Verify: No formatting changes from step 1
6. Verify: All tests pass
```

### When Reviewing Go Code

```
1. Check formatting first (gofmt)
2. Verify export capitalization rules
3. Confirm all errors are handled
4. Check for context.Context as first parameter
5. Verify no utils/ or helpers/ packages
6. Confirm godoc comments on exported items
```

---

## 📚 References

- [Effective Go](https://go.dev/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)

---

## 🔧 Recommended Toolchain

### Essential Tools

```bash
# Install formatting tools
go install golang.org/x/tools/cmd/goimports@latest

# Install linter
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

### CI Integration

```yaml
# Example GitHub Actions
- name: Format check
  run: |
    gofmt -l . | grep . && exit 1 || exit 0
    
- name: Vet
  run: go vet ./...
  
- name: Test
  run: go test ./...
  
- name: Lint
  run: golangci-lint run
```

---

**Remember**: In Go, consistency and simplicity trump personal preference. When in doubt, follow the community standard.
