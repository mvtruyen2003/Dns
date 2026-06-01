/*
 * Script bypass Anti-AdBlock cho rophim1.vip (Dựa trên AdBlockProbe)
 * Chạy ở chế độ document-start
 */

(function() {
    // Tạo object giả lập để đánh lừa bộ quét của website
    const mockProbe = {
        STATUS: "success",
        totalRuns: "8/8 (0 còn lại)",
        sessionRuns: "8/8 (0 còn lại session)",
        global2: "4/4 (0 còn lại)",
        prof: "4/4 (0 còn lại)"
    };

    // Định nghĩa AdBlockProbe vào hệ thống của trình duyệt
    if (!window.AdBlockProbe) {
        window.AdBlockProbe = mockProbe;
    } else {
        Object.assign(window.AdBlockProbe, mockProbe);
    }

    // Ghi đè các hàm kiểm tra phổ biến nếu có
    window.isAdBlockActive = false;
    window.canRunAds = true;
})();

$done({});
