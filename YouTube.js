/**
 * @fileoverview Lọc quảng cáo YouTube & Kích hoạt các tính năng Premium (Xem nền, PiP)
 * @supported Shadowrocket, Surge, Quantumult X
 */

const url = $request.url;
if (!$response || !$response.body) $done({});

let body = $response.body;

// Kiểm tra nếu dữ liệu trả về là dạng text/json
try {
    let obj = JSON.parse(body);

    // 1. Khử quảng cáo chèn giữa video (Ad-placements)
    if (obj.adPlacements) {
        delete obj.adPlacements;
    }
    if (obj.adSlots) {
        delete obj.adSlots;
    }

    // 2. Bẻ khóa tính năng Premium (Xem nền + PiP + Không quảng cáo tầng Player)
    if (url.indexOf("v1/player") !== -1) {
        if (obj.playabilityStatus) {
            // Ép trạng thái phát luôn luôn là hợp lệ và mở khóa Background Play
            obj.playabilityStatus.status = "OK";
            if (obj.playabilityStatus.miniplayer) {
                obj.playabilityStatus.miniplayer.miniplayerRenderer = {
                    "playbackMode": "PLAYBACK_MODE_ALLOW"
                };
            }
        }
        // Kích hoạt tính năng chạy nền từ phía Client
        if (obj.attestation) {
            delete obj.attestation;
        }
    }

    // 3. Loại bỏ Banner quảng cáo và Shorts quảng cáo ở trang chủ (Browse/Next)
    if (url.indexOf("v1/browse") !== -1 || url.indexOf("v1/next") !== -1) {
        if (obj.contents) {
            body = JSON.stringify(obj).replace(/"adSlotRenderer":\{.*?\}/g, '"adSlotRenderer":{}');
            obj = JSON.parse(body);
        }
    }

    body = JSON.stringify(obj);
} catch (e) {
    // Nếu gặp dữ liệu Protobuf thô chưa mã hóa JSON, cấu trúc lại luồng để không gây crash app
    if (body.includes("ad_placement")) {
        body = body.replace(/ad_placement.*?(\,|$)/g, "");
    }
}

$done({ body });
