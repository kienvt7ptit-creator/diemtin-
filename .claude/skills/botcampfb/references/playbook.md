# Playbook chạy camp Meta Ads

## 1. Ngưỡng tham khảo (điểm xuất phát, chỉnh theo số liệu thật của tài khoản)

Số dưới đây là mức hay gặp ở thị trường VN, không phải chuẩn của Meta. Luôn ưu tiên số trung bình 30 ngày của chính tài khoản.

| Ngành / mục tiêu | CTR liên kết ổn | CPM thường gặp | CPR tham khảo |
|---|---|---|---|
| BĐS, thu lead form | ≥ 0,8% | 60k–150k | 80k–250k/lead (cao cấp có thể 300k+) |
| BĐS, tin nhắn | ≥ 1% | 50k–120k | 30k–120k/tin nhắn |
| Spa / làm đẹp / dịch vụ địa phương | ≥ 1,2% | 30k–80k | 20k–80k/lead |
| Giáo dục / khoá học | ≥ 1% | 40k–100k | 40k–150k/lead |
| TMĐT, mua hàng | ≥ 1,2% | 30k–90k | xem ROAS: hoà vốn = 1 / biên lợi nhuận gộp |

Cách đặt ngưỡng từ CPR mục tiêu `T`:
- Tắt khi chi ≥ 2–3×T mà 0 kết quả (cho đủ cơ hội ra kết quả đầu tiên).
- Tắt khi CPR trong ngày > 2,5×T và đã chi ≥ 5×T.
- Giảm khi CPR 3 ngày trong khoảng 1,8×T đến 2,5×T.
- Tăng khi CPR 3 ngày ≤ 1,2×T, có ≥ 5 kết quả, tần suất < 2,5.

## 2. Bảng chẩn đoán

| Triệu chứng | Nguyên nhân hay gặp | Việc nên làm |
|---|---|---|
| CTR thấp (< 0,6%), CPM bình thường | Creative/hook yếu, sai insight | Thay 3 giây đầu video / ảnh đầu, test 3–5 góc mới |
| CPM cao, CTR ổn | Tệp quá hẹp, mùa cạnh tranh (Tết, 11.11), chất lượng quảng cáo thấp | Mở rộng tệp (broad/Advantage+), gộp adset, kiểm tra điểm xếp hạng chất lượng |
| CTR tốt nhưng CPR cao | Form/landing kém, câu hỏi form quá dài, sale phản hồi chậm | Rút gọn form, thêm câu hỏi lọc, kiểm tra tốc độ trang, kịch bản gọi lại trong 5 phút |
| Tần suất ≥ 3,5, CTR giảm dần | Mỏi quảng cáo | Làm creative mới, loại trừ người đã tương tác/đã chuyển đổi, mở rộng tệp |
| Lead nhiều nhưng rác | Form "khối lượng cao", nội dung quá mồi | Dùng form "ý định cao hơn", thêm câu hỏi lọc (ngân sách, khu vực, thời gian mua) |
| Chi không hết ngân sách | Tệp quá nhỏ, giá thầu/giới hạn chi phí quá thấp, quảng cáo bị hạn chế | Mở tệp, bỏ cost cap, kiểm tra trạng thái duyệt |
| Kết quả tụt đột ngột sau khi sửa | Adset quay lại giai đoạn học | Tránh sửa lớn liên tục, đợi 3 ngày / ~50 kết quả |

## 3. Quy tắc scale và tắt

- **Tăng dọc** (vertical): ≤ 20%/lần, cách nhau ≥ 24h. Tăng mạnh hơn dễ làm adset quay lại giai đoạn học.
- **Tăng ngang** (horizontal): nhân bản adset winner sang tệp mới hoặc lookalike thay vì tăng gấp đôi ngân sách.
- **Đừng phán quyết quá sớm**: cần đủ dữ liệu (≥ 2–3×CPR mục tiêu tiền chi) trước khi tắt, trừ khi số quá tệ.
- **Đừng tắt cả adset vì 1 ad kém**: tắt ad trước, adset sau.
- **CBO**: ngân sách ở campaign, bot không chỉnh. Muốn scale thì chỉnh ở campaign bằng tay.
- **Giờ chạy bot**: số liệu "today" buổi sáng còn ít, nên ngưỡng tắt dựa trên số tiền đã chi chứ không theo giờ. Meta có độ trễ báo cáo 15–30 phút.
- **Luôn giữ nhóm thử nghiệm**: dành 10–20% ngân sách để test creative/tệp mới.
