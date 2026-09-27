# Tinyrenderer：OBJ 文本解析中的 C++ 标准库

在制作 tinyrenderer 的线框图时，我需要从 `obj/floor.obj` 逐行读取文本：`v` 行提供坐标，`f` 行提供顶点编号。这里记下用到的 C++ 标准库工具。

这些函数不用全部背下来；重要的是记住每一步要解决什么问题。

## 1. 按行读文件：`ifstream` + `getline`

```cpp
std::ifstream file("obj/floor.obj");
std::string line;
while (std::getline(file, line)) {
    // line 是当前这一整行文字
}
```

- `std::ifstream`：打开文件用于读取，需要 `#include <fstream>`。
- `std::getline(file, line)`：读入一整行；读不到下一行时，循环结束。
- 这一步得到的仍是**文字**，还没有把坐标拆成数字。

## 2. 判断行的种类：`starts_with`

```cpp
if (line.starts_with("v ")) {
    // 顶点坐标
} else if (line.starts_with("f ")) {
    // 面的顶点编号
}
```

`starts_with` 判断字符串是否以指定内容开头，属于 **C++20**。写 `"v "`（带空格）比只写 `"v"` 更明确。

## 3. 从一行里逐项读取：`istringstream`

```cpp
std::istringstream row(line);
char tag;
float x, y, z;
row >> tag >> x >> y >> z;
```

需要 `#include <sstream>`。可以把 `row` 想成“输入来源是 `line` 的 `std::cin`”；`row` 只是变量名。

例如 `line` 是 `v -1 -1 1` 时，依次读到 `tag = 'v'`、`x = -1`、`y = -1`、`z = 1`。

对于 `f 3/3/1 2/2/1 1/1/1`，可以先用 `row >> tag` 跳过 `f`，再用 `row >> s` 把 `3/3/1` **整段读成字符串**。`istringstream` 不会自动解释 `/` 的意义。

## 4. 取出 `f` 中斜杠前的编号

```cpp
row >> s;  // 例如 s 变成 "1193/1240/1193"
int index = std::stoi(s.substr(0, s.find('/')));
```

从里往外看：

1. `s.find('/')` 找到第一个 `/` 的位置。
2. `s.substr(0, 位置)` 取出前面的文字，例如 `"1193"`。
3. `std::stoi(...)` 把文字转成整数 `1193`。

不能只用 `s[0]`：它只取**第一个字符**，`"1193/..."` 会只得到 `'1'`。

## 小结

文件 → `getline` 取一行 → `starts_with` 判断 `v` / `f` → `istringstream` 逐项读取 → 从 `f` 的斜杠前取编号。
