/*
 * Script diệt sạch mọi loại Popup Anti-Adblock bằng CSS
 * Chạy ở chế độ http-response (Sửa đổi HTML trả về)
 */

let body = $response.body;

if (body) {
    // Đoạn CSS này sẽ ép ẩn tất cả các thẻ div có tên chứa chữ "adblock", "popup"
    // Đồng thời ép Safari phải mở khóa tính năng cuộn trang (scroll)
    const cssForce = `
    <style>
        div[class*="adblock"], 
        div[id*="adblock"], 
        div[class*="popup"],
        .popup-adblock { 
            display: none !important; 
            visibility: hidden !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
        }
        html, body { 
            overflow: auto !important; 
            overflow-y: scroll !important;
            position: unset !important; 
        }
    </style>
    `;

    // Bơm thẳng đoạn CSS này vào ngay đầu thẻ <head> của trang web
    body = body.replace('<head>', '<head>' + cssForce);
}

$done({ body });
