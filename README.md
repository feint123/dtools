# dtools
基于tauri实现的工具集合应用，支持插件安装

----

⚠️ **最新代码请切换至 [dev](https://github.com/feint123/dtools/tree/dev) 分支**

如果加载的插件中使用到了tauri的api，在编译项目前请先修改tauri的部分源码

目录：tauri-1.2.3>src>api>ipc.rs>format_callback

原来的代码

```rust
pub fn format_callback<T: Serialize>(
  function_name: CallbackFn,
  arg: &T,
) -> crate::api::Result<String> {
  serialize_js_with(arg, Default::default(), |arg| {
    format!(
      r#"
    if (window["_{fn}"]) {{
      window["_{fn}"]({arg})
    }} else {{
      console.warn("[TAURI] Couldn't find callback id {fn} in window. This happens when the app is reloaded while Rust is running an asynchronous operation.")
    }}"#,
      fn = function_name.0,
      arg = arg
    )
  })
}
```

修改后的代码

```rust
pub fn format_callback<T: Serialize>(
  function_name: CallbackFn,
  arg: &T,
) -> crate::api::Result<String> {
  serialize_js_with(arg, Default::default(), |arg| {
    format!(
      r#"
    if (window["_{fn}"]) {{
      window["_{fn}"]({arg})
    }} else {{
      if ( null != document.getElementById('__plugin_container__') && document.getElementById('__plugin_container__').contentWindow["_{fn}"]) {{
        document.getElementById('__plugin_container__').contentWindow["_{fn}"]({arg})
      }} else {{
        console.warn("[TAURI] Couldn't find callback id {fn} in window. This happens when the app is reloaded while Rust is running an asynchronous operation.")
      }}
    }}"#,
      fn = function_name.0,
      arg = arg
    )
  })
}
```
