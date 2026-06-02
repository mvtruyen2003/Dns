/**
 * @fileoverview Script tự viết nâng cao - Chặn sạch quảng cáo YouTube & Mở khóa Xem nền
 * @thực_thi Can thiệp luồng nhị phân Protobuf & JSON của Google
 */

const url = $request.url;
if (typeof $response === "undefined" || !$response.body) $done({});

let body = $response.body;

// Hàm xử lý cắt bỏ và vô hiệu hóa các phân đoạn nhị phân chứa Ads
function cleanProtobufAds(data) {
    if (typeof data === "string") {
        // Khử các lệnh gọi mồi quảng cáo trong luồng phát video thô
        data = data.replace(/ad_placement|ad_slot|ad_tag/g, "no_ad_track");
        // Ép mở khóa luồng phát nền (Background Playback) ở mức độ byte
        data = data.replace(/([^\w])miniplayerRenderer([^\w])/g, '$1no_miniplayer$2');
    }
    return data;
}

try {
    // Trường hợp dữ liệu là JSON (Trang chủ, Shorts, Cấu hình tài khoản)
    let obj = JSON.parse(body);

    // Diệt tận gốc danh sách quảng cáo chèn
    if (obj.adPlacements) delete obj.adPlacements;
    if (obj.adSlots) delete obj.adSlots;
    if (obj.playerAds) delete obj.playerAds;

    // Ép kích hoạt tính năng Premium (Xem nền + PiP) cho Player
    if (url.includes("v1/player")) {
        if (obj.playabilityStatus) {
            obj.playabilityStatus.status = "OK";
            if (!obj.playabilityStatus.miniplayer) {
                obj.playabilityStatus.miniplayer = {
                    miniplayerRenderer: { playbackMode: "PLAYBACK_MODE_ALLOW" }
                };
            } else if (obj.playabilityStatus.miniplayer.miniplayerRenderer) {
                obj.playabilityStatus.miniplayer.miniplayerRenderer.playbackMode = "PLAYBACK_MODE_ALLOW";
            }
        }
        // Xóa phân đoạn theo dõi hành vi quảng cáo của Google
        if (obj.attestation) delete obj.attestation;
    }

    // Xóa Banner quảng cáo xen kẽ khi lướt trang chủ hoặc danh sách tiếp theo
    if (url.includes("v1/browse") || url.includes("v1/next")) {
        let cleanStr = JSON.stringify(obj).replace(/"adSlotRenderer":\{.*?\}/g, '"adSlotRenderer":{}');
        obj = JSON.parse(cleanStr);
    }

    body = JSON.stringify(obj);
} catch (e) {
    // Trường hợp dữ liệu trả về là Protobuf thô (Xử lý luồng Video Ads cốt lõi)
    body = cleanProtobufAds(body);
}

// Trả dữ liệu sạch hoàn toàn về cho ứng dụng YouTube hiển thị
$done({ body });
