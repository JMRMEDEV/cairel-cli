- https://github.com/JMRMEDEV/amazon-q-history-mcp-server

```
Amazon Q History MCP Server
Track Amazon Q sessions, maintain context across crashes, and monitor progress toward goals.

Features
Session Tracking: Unique session IDs with agent name and timestamp
Session Management: Gracefully close and switch between multiple sessions
Context Preservation: Extract and store goals, requirements, and constraints
Progress Monitoring: Track actions and success criteria
Crash Recovery: Backup to /tmp with restoration capabilities
Worklog Management: Chronological action tracking with status
Backup Restoration: Restore deleted sessions from /tmp backup
Hook Integration: Support for Q CLI hook events for automatic operation tracking
```

- https://github.com/JMRMEDEV/amazon-q-web-scraper-mcp

```
Enhanced Web Scraper MCP Server
A professional Model Context Protocol (MCP) server for web scraping, React app testing, and React Native web app inspection using Playwright. Fully backward compatible with regular websites and standard React applications.

🚀 Latest Improvements
🔥 Context-Optimized Screenshots - Screenshots return only file paths and analysis text (no base64 data)
📊 Enhanced Page Analysis - Detailed element counting, content structure analysis, and page state inspection
🔍 Comprehensive Comparison Tools - Visual similarity analysis with layout, color, and typography detection
💾 File-Based Output - All screenshots saved to /tmp/ with structured analysis data
🎯 Smart Content Detection - Automatically detects empty states, loading indicators, and content availability
Enhanced Error Handling - Comprehensive input validation and error reporting
Optimized Performance - Reduced code duplication and improved efficiency
Standardized Timeouts - Configurable timeout constants for reliability
Professional Code Structure - ES6+ best practices and maintainable architecture
```

- https://github.com/JMRMEDEV/amazon-q-gpt-mcp-server

```
GPT Agent MCP Server
An MCP server that provides a ChatGPT agent specialized in software architecture, full-stack development, and code debugging.

Features
Specialized Agent: Focused on software development, architecture, and debugging
Real Web Search: DuckDuckGo integration for live search results
Conversation Memory: Maintains context across interactions
Attempt Tracking: Monitors failed solutions to trigger web search automatically
GPT-4o-mini: Cost-efficient model optimized for development tasks
Three Core Tools: Chat, reset conversation, and status checking
```

- https://github.com/JMRMEDEV/amazon-q-chakra-ui-mcp-server

```
Chakra UI MCP Server
This MCP server provides access to all tools from the official @chakra-ui/react-mcp package.
```

- https://github.com/JMRMEDEV/amazon-q-cypress-mcp

```
Cypress MCP Server
An enhanced Model Context Protocol (MCP) server for running Cypress E2E tests with advanced screenshot handling, clean output formatting, and automatic file management.

Features
🖼️ Enhanced Screenshot Management
Viewport Only Capture: Screenshots capture only the rendered application content, not the Cypress runner UI
Success Screenshots: Automatically captures screenshots for both failed AND successful tests
Clean Naming: Screenshots are copied to /tmp with predictable names: screenshot-cypress-<timestamp>-<uuid>.png
Automatic Cleanup: Removes temporary test files and original screenshots after execution
AI-Ready Output: Returns /tmp screenshot paths for easy AI processing
📊 Clean Output & Logging
Structured Results: Returns comprehensive test results including successes, failures, and execution summaries
Clean Logs: Removes ANSI escape codes and formats output for readability
Detailed Test Info: Provides test duration, error details, and execution statistics
JSON Parsing: Handles both successful JSON parsing and fallback to raw output
🔧 Advanced Configuration
Webpack Overlay Handling: Optional handling of webpack dev server overlays
Custom Browser Support: Chrome, Firefox, Edge, Electron support
Flexible Test Input: Accept test code as string or spec file paths
Base URL Configuration: Automatic base URL setup for testing
Installation
```