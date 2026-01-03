# PixoScript Standard Library Reference

**Version:** 1.0.0  
**Last Updated:** January 2, 2026

---

## Table of Contents

1. [Base Library](#base-library)
2. [Math Library](#math-library)
3. [String Library](#string-library)
4. [Table Library](#table-library)
5. [OS Library](#os-library)
6. [IO Library](#io-library)
7. [Coroutine Library](#coroutine-library)
8. [Debug Library](#debug-library)
9. [Source Map Library](#source-map-library)
10. [Package Library](#package-library)

---

## Base Library

Global functions available without requiring a module.

### `assert(v, message)`
Raises an error if `v` is falsy.

```lua
assert(x > 0, "x must be positive")
```

### `error(message, level)`
Raises an error with the given message.

```lua
if bad_input then
  error("Invalid input provided", 2)
end
```

### `getmetatable(object)`
Returns the metatable of the given object, or nil.

### `setmetatable(table, metatable)`
Sets the metatable for a table. Returns the table.

```lua
local t = {}
setmetatable(t, { __tostring = function() return "custom" end })
```

### `ipairs(t)`
Returns an iterator for array-style tables.

```lua
for i, v in ipairs(myArray) do
  print(i, v)
end
```

### `pairs(t)`
Returns an iterator for all key-value pairs.

```lua
for k, v in pairs(myTable) do
  print(k, v)
end
```

### `next(table, index)`
Returns the next key-value pair in a table.

### `pcall(f, ...)`
Calls a function in protected mode. Returns success boolean and results.

```lua
local ok, result = pcall(riskyFunction, arg1, arg2)
if not ok then
  print("Error:", result)
end
```

### `xpcall(f, errHandler, ...)`
Like pcall but with a custom error handler.

### `print(...)`
Prints values to the output.

### `rawequal(v1, v2)`
Compares values without invoking metamethods.

### `rawget(table, index)`
Gets a table value without invoking `__index`.

### `rawset(table, index, value)`
Sets a table value without invoking `__newindex`.

### `select(index, ...)`
Returns values from a vararg list.

```lua
local count = select('#', ...)  -- Get count
local third = select(3, ...)    -- Get third element
```

### `tonumber(e, base)`
Converts a value to a number.

### `tostring(e)`
Converts a value to a string.

### `type(v)`
Returns the type of a value as a string.

```lua
type(42)        -- "number"
type("hello")   -- "string"
type({})        -- "table"
type(nil)       -- "nil"
```

---

## Math Library

Mathematical functions. Access via `math.` prefix.

### Constants

- `math.pi` - π (3.14159...)
- `math.huge` - Infinity
- `math.maxinteger` - Maximum safe integer
- `math.mininteger` - Minimum safe integer

### Trigonometric Functions

```lua
math.sin(x)    -- Sine (radians)
math.cos(x)    -- Cosine (radians)
math.tan(x)    -- Tangent (radians)
math.asin(x)   -- Arc sine
math.acos(x)   -- Arc cosine
math.atan(y, x) -- Arc tangent (atan2)
math.sinh(x)   -- Hyperbolic sine
math.cosh(x)   -- Hyperbolic cosine
math.tanh(x)   -- Hyperbolic tangent
```

### Rounding Functions

```lua
math.floor(x)  -- Round down
math.ceil(x)   -- Round up
math.abs(x)    -- Absolute value
math.fmod(x, y) -- Float modulo
math.modf(x)   -- Integer and fractional parts
```

### Power and Logarithm

```lua
math.sqrt(x)   -- Square root
math.pow(x, y) -- x^y (or use x^y)
math.exp(x)    -- e^x
math.log(x, base) -- Logarithm
math.log10(x)  -- Base-10 logarithm
```

### Angle Conversion

```lua
math.rad(degrees) -- Degrees to radians
math.deg(radians) -- Radians to degrees
```

### Min/Max

```lua
math.min(x, ...)  -- Minimum value
math.max(x, ...)  -- Maximum value
```

### Random Numbers

```lua
math.random()        -- Random float [0, 1)
math.random(n)       -- Random integer [1, n]
math.random(m, n)    -- Random integer [m, n]
math.randomseed(x)   -- Set random seed
```

### Integer Operations

```lua
math.tointeger(x)    -- Convert to integer
math.type(x)         -- "integer", "float", or nil
math.ult(m, n)       -- Unsigned less than
```

---

## String Library

String manipulation functions. Access via `string.` prefix or as methods on strings.

### Basic Operations

```lua
string.len(s)           -- Length (or #s)
string.upper(s)         -- Uppercase
string.lower(s)         -- Lowercase
string.reverse(s)       -- Reverse string
string.rep(s, n, sep)   -- Repeat n times
string.sub(s, i, j)     -- Substring [i, j]
```

### Character Operations

```lua
string.byte(s, i, j)    -- Get byte codes
string.char(...)        -- Bytes to string
```

### Pattern Matching

```lua
string.find(s, pattern, init, plain)  -- Find pattern
string.match(s, pattern, init)        -- Extract match
string.gmatch(s, pattern)             -- Iterator over matches
string.gsub(s, pattern, repl, n)      -- Replace pattern
```

#### Pattern Syntax

| Pattern | Meaning |
|---------|---------|
| `.` | Any character |
| `%a` | Letter |
| `%d` | Digit |
| `%s` | Whitespace |
| `%w` | Alphanumeric |
| `%p` | Punctuation |
| `%c` | Control character |
| `%x` | Hexadecimal digit |
| `[set]` | Character class |
| `[^set]` | Complement of class |
| `*` | 0 or more (greedy) |
| `+` | 1 or more (greedy) |
| `-` | 0 or more (lazy) |
| `?` | 0 or 1 |
| `^` | Start of string |
| `$` | End of string |
| `%b()` | Balanced brackets |

### Formatting

```lua
string.format(fmt, ...)  -- Printf-style formatting
```

Format specifiers: `%d`, `%i`, `%o`, `%x`, `%X`, `%e`, `%E`, `%f`, `%g`, `%G`, `%s`, `%q`, `%%`

---

## Table Library

Table manipulation. Access via `table.` prefix.

### Array Operations

```lua
table.insert(t, pos, value)  -- Insert at position
table.insert(t, value)       -- Append
table.remove(t, pos)         -- Remove at position
table.concat(t, sep, i, j)   -- Join with separator
```

### Sorting

```lua
table.sort(t, comp)          -- Sort in place
```

### Packing/Unpacking

```lua
table.pack(...)              -- Create table from varargs
table.unpack(t, i, j)        -- Expand table to values
table.move(a1, f, e, t, a2)  -- Move elements
```

---

## OS Library

Operating system facilities (limited for security).

```lua
os.time(table)       -- Current time or from table
os.date(format, time) -- Format time
os.difftime(t2, t1)  -- Time difference
os.clock()           -- CPU time
```

### Date Format Specifiers

| Code | Meaning |
|------|---------|
| `%Y` | Full year |
| `%m` | Month (01-12) |
| `%d` | Day (01-31) |
| `%H` | Hour (00-23) |
| `%M` | Minute (00-59) |
| `%S` | Second (00-59) |
| `%w` | Weekday (0-6) |
| `%j` | Day of year |
| `%a` | Abbreviated weekday |
| `%b` | Abbreviated month |

---

## IO Library

File input/output (sandboxed virtual filesystem).

### Opening Files

```lua
local file, err = io.open(filename, mode)
```

Modes: `"r"` (read), `"w"` (write), `"a"` (append)

### File Handle Methods

```lua
file:read(format)    -- Read data
file:write(...)      -- Write data
file:seek(whence, offset)  -- Position cursor
file:flush()         -- Flush buffers
file:close()         -- Close file
file:lines()         -- Line iterator
```

### Read Formats

| Format | Meaning |
|--------|---------|
| `"*a"` | Read all |
| `"*l"` | Read line (no newline) |
| `"*L"` | Read line (with newline) |
| `"*n"` | Read number |
| `n` | Read n bytes |

### Quick Functions

```lua
io.read(...)         -- Read from stdin
io.write(...)        -- Write to stdout
io.lines(filename)   -- Iterate file lines
```

### Example

```lua
local file = io.open("data.txt", "r")
if file then
  for line in file:lines() do
    print(line)
  end
  file:close()
end
```

---

## Coroutine Library

Cooperative multitasking. Access via `coroutine.` prefix.

### Creating Coroutines

```lua
local co = coroutine.create(function(arg)
  print("Started with", arg)
  local value = coroutine.yield("yielded")
  print("Resumed with", value)
  return "done"
end)
```

### Running Coroutines

```lua
coroutine.resume(co, ...)  -- Start or continue
coroutine.yield(...)       -- Pause and return values
```

### Status and Inspection

```lua
coroutine.status(co)       -- "suspended", "running", "normal", "dead"
coroutine.running()        -- Current coroutine
coroutine.isyieldable()    -- Can yield?
```

### Wrapped Coroutines

```lua
local wrapped = coroutine.wrap(function(x)
  while true do
    x = coroutine.yield(x * 2)
  end
end)

print(wrapped(5))   -- 10
print(wrapped(3))   -- 6
```

### Example: Generator

```lua
function range(from, to)
  return coroutine.wrap(function()
    for i = from, to do
      coroutine.yield(i)
    end
  end)
end

for i in range(1, 5) do
  print(i)  -- 1, 2, 3, 4, 5
end
```

---

## Debug Library

Debugging facilities. Access via `debug.` prefix.

### Stack Inspection

```lua
debug.traceback(message, level)  -- Get stack trace
debug.getinfo(f, what)           -- Get function info
```

### Info Fields

| Field | What | Description |
|-------|------|-------------|
| `name` | `n` | Function name |
| `source` | `S` | Source file |
| `linedefined` | `S` | Line where defined |
| `what` | `S` | "Lua", "C", "main" |
| `currentline` | `l` | Current line |
| `nups` | `u` | Number of upvalues |

### Variable Access

```lua
debug.getlocal(level, index)       -- Get local variable
debug.setlocal(level, index, value) -- Set local variable
debug.getupvalue(f, index)         -- Get upvalue
debug.setupvalue(f, index, value)  -- Set upvalue
```

### Metatable Access

```lua
debug.getmetatable(value)  -- Bypass __metatable
debug.setmetatable(value, mt)  -- Set metatable
```

### Hooks

```lua
debug.sethook(hook, mask, count)  -- Set debug hook
debug.gethook()                   -- Get current hook
```

Hook masks: `"c"` (call), `"r"` (return), `"l"` (line)

### Inspection Utility

```lua
debug.inspect(value)  -- Pretty-print value
```

---

## Source Map Library

Source map generation for debugging. Access via `sourcemap.` prefix.

### Generator

```lua
local gen = sourcemap.generator("output.js", "")

gen.addSource("input.pxs", sourceContent)
gen.addMapping(outLine, outCol, "input.pxs", srcLine, srcCol, name)

local map = gen.toJSON()     -- As Lua table
local str = gen.toString()   -- As JSON string
local url = gen.toDataURL()  -- As data URI
local comment = gen.toComment()  -- As //# sourceMappingURL comment
```

### Consumer

```lua
local consumer = sourcemap.consumer(jsonString)

local pos = consumer.originalPositionFor(line, column)
-- pos.source, pos.line, pos.column, pos.name

local genPos = consumer.generatedPositionFor("input.pxs", line, column)
-- genPos.line, genPos.column

local content = consumer.sourceContentFor("input.pxs")
```

---

## Package Library

Module loading. Access via `package.` or `require`.

### Loading Modules

```lua
local mod = require("mymodule")
```

### Package Configuration

```lua
package.path     -- Search path pattern
package.loaded   -- Already loaded modules
package.preload  -- Preloaders
```

### Custom Loaders

```lua
package.preload["mymodule"] = function()
  return { foo = 42 }
end
```

---

## Type Reference

### LuaType

PixoScript supports these types:

| Type | Example |
|------|---------|
| `nil` | `nil` |
| `boolean` | `true`, `false` |
| `number` | `42`, `3.14`, `0xFF` |
| `string` | `"hello"`, `'world'` |
| `table` | `{}`, `{1, 2, 3}` |
| `function` | `function() end` |

### Truthiness

Only `nil` and `false` are falsy. Everything else (including `0` and `""`) is truthy.

---

## Error Handling

### Protected Calls

```lua
local ok, err = pcall(function()
  -- risky code
  error("something went wrong")
end)

if not ok then
  print("Error:", err)
end
```

### Error Propagation

```lua
assert(condition, "Error message")
error("Fatal error", 2)  -- Level 2 = caller's context
```

---

## Best Practices

1. **Use local variables** for better performance
2. **Prefer ipairs for arrays** when order matters
3. **Check for nil** before accessing table fields
4. **Use pcall** for error-prone operations
5. **Document your functions** with comments
6. **Keep coroutines short** to avoid blocking
7. **Close file handles** when done

---

*PixoScript is a Lua 5.3 compatible scripting language for the PixoSpritz game engine.*
