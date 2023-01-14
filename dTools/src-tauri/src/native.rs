#[cfg(target_os = "macos")]
pub fn native_windows(window: &tauri::Window, vibrancy_radius: Option<f64>, need_toolbar: bool) {
    use cocoa::{
        appkit::{NSWindow, NSWindowToolbarStyle},
        base::id,
    };
    use objc::{class, msg_send, sel, sel_impl};
    // use window_shadows::set_shadow;　
    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

    // set_shadow(window, true).unwrap();

    apply_vibrancy(
        window,
        NSVisualEffectMaterial::Sidebar,
        None,
        vibrancy_radius,
    )
    .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS"); 
    
    if need_toolbar {
        // 添加toolbar让"红绿灯"看起来更自然
        let ns_window = window.ns_window().unwrap() as id;
        unsafe {
            ns_window.setToolbar_(msg_send![class!(NSToolbar), new]);
            ns_window.setToolbarStyle_(NSWindowToolbarStyle::NSWindowToolbarStyleUnifiedCompact);
        }
    }
}
