export type Language = 'vi' | 'en' | 'zh' | 'ja' | 'ko';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
];

export const translations = {
  vi: {
    // Header
    header: {
      sheets: "Google Sheets",
      priceTable: "Bảng Giá",
      history: "Lịch Sử",
      manageOrders: "Quản Lý Đơn",
      zalo: "Zalo 24/7",
      hotlineTooltip: "Gọi hotline tư vấn nhanh"
    },
    // Hero Banner
    hero: {
      badgeTitle: "Dịch Vụ Lái Xe Hộ Chuyên Nghiệp Hàng Đầu",
      badgeEta: "Có mặt sau 10-15 phút",
      mainTitle: "Bạn Đợi Tiệc Vui – ",
      mainTitleHighlight: "D.GO Lái Xe An Toàn Về Nhà",
      description: "Đặt tài xế riêng lái ô tô, xe máy đưa bạn và xế yêu về tận nhà an toàn 24/7. Không lo vi phạm nồng độ cồn, không ngại mệt mỏi hay đường xa.",
      feat1Title: "An Toàn 100%",
      feat1Sub: "Tài xế lành nghề",
      feat2Title: "Phục Vụ 24/7",
      feat2Sub: "Bất kể ngày đêm",
      feat3Title: "Minh Bạch Cước",
      feat3Sub: "Biết trước số tiền",
      feat4Title: "Lái Xe An Toàn",
      feat4Sub: "Cẩn thận & Trách nhiệm"
    },
    // Booking Form
    form: {
      title: "Đặt Dịch Vụ Lái Xe Hộ D.GO",
      subtitle: "Có mặt nhanh chóng trong 10 - 15 phút sau khi xác nhận",
      secCustomer: "1. Thông tin khách hàng",
      nameLabel: "Họ và tên khách hàng",
      namePlaceholder: "Nhập họ tên của bạn",
      phoneLabel: "Số điện thoại liên hệ",
      phonePlaceholder: "Nhập số điện thoại (vd: 0877683536)",
      secVehicle: "2. Chọn loại xe & dịch vụ",
      hourlySelectLabel: "Thời gian thuê gói",
      secRoute: "3. Hành trình di chuyển",
      pickupLabel: "Điểm đón khách",
      pickupPlaceholder: "Nhập địa chỉ đón (ví dụ: 123 Nguyễn Trãi, Thanh Xuân)",
      getGpsBtn: "Lấy vị trí hiện tại của tôi",
      gettingGps: "Đang định vị GPS...",
      destLabel: "Điểm trả khách",
      destPlaceholder: "Nhập địa chỉ trả (ví dụ: Landmark 81, TP.HCM)",
      noteLabel: "Ghi chú cho tài xế",
      notePlaceholder: "Ví dụ: Xe ô tô tự động Mazda CX5, tài xế mang theo mũ bảo hiểm...",
      secTime: "4. Thời gian đón",
      pickupNow: "Đón ngay (sau 10-15 phút)",
      schedulePickup: "Hẹn giờ đón",
      vatCheck: "Xuất hóa đơn VAT (Công ty)",
      companyName: "Tên công ty",
      companyNamePlaceholder: "Nhập tên công ty xuất hóa đơn",
      taxCode: "Mã số thuế",
      taxCodePlaceholder: "Nhập mã số thuế",
      companyAddress: "Địa chỉ công ty",
      companyAddressPlaceholder: "Nhập địa chỉ công ty",
      vatEmail: "Email nhận hóa đơn",
      vatEmailPlaceholder: "Nhập email nhận hóa đơn điện tử",
      liveTotalTitle: "Tổng tiền dự tính",
      calculatingRoute: "Đang tính lại...",
      hourlyRentalFor: "Thuê theo gói",
      roadDistance: "Quãng đường ô tô:",
      estimatedDuration: "phút di chuyển",
      enterAddressPrompt: "Vui lòng nhập điểm đón & điểm đến để tự động tính tiền",
      noVatNote: "Chưa bao gồm VAT (Tự động tính theo bảng giá)",
      submitBtn: "XÁC NHẬN ĐẶT TÀI XẾ D.GO",
      submitting: "Đang xử lý...",
      autoMapTitle: "Bản đồ tự động tìm tuyến đường tối ưu"
    },
    // Vehicle types
    vehicle: {
      carAndMotorbike: "Ô tô / Xe máy",
      luxury: "Xe Sang",
      hourlyCarAndMotorbike: "Thuê theo giờ (Ô tô / Xe máy)",
      hourlyLuxury: "Thuê theo giờ (Xe Sang)",
      dailyCarAndMotorbike: "Thuê theo ngày (Ô tô / Xe máy)",
      dailyLuxury: "Thuê theo ngày (Xe Sang)"
    },
    // Summary Card
    summary: {
      title: "TÓM TẮT CHI PHÍ ĐẶT XE",
      routeSummary: "Lộ trình di chuyển",
      from: "Từ:",
      to: "Đến:",
      vehicleType: "Loại dịch vụ / Phương tiện:",
      distance: "Khoảng cách & Thời gian:",
      basePrice: "Cước phí dịch vụ gốc:",
      nightSurcharge: "Phụ phí đêm:",
      vatFee: "Thuế VAT (8%):",
      totalEst: "TỔNG TIỀN DỰ KIẾN",
      noVatNote: "Giá trên chưa bao gồm thuế VAT (nếu chọn)",
      waitingFeeNoteTitle: "Lưu ý quan trọng:",
      waitingFeeNoteBody: "Tổng tiền chưa bao gồm phí chờ (+60.000 VNĐ/h chờ), phí phát sinh điểm dừng. (Lưu ý: Giá trên chưa bao gồm hỗ trợ chi phí ăn ở cho tài xế).",
      contactHotlineText: "(vui lòng liên hệ hotline",
      contactHotlineSub: "để được tư vấn)"
    },
    // Modals
    modals: {
      confirmBookingTitle: "XÁC NHẬN ĐƠN ĐẶT XẾ D.GO",
      confirmSubtitle: "Vui lòng kiểm tra kỹ thông tin hành trình trước khi gửi đơn",
      btnCancel: "Quay lại chỉnh sửa",
      btnConfirm: "XÁC NHẬN & GỬI ĐƠN ĐẶT TÀI XẾ",
      historyTitle: "LỊCH SỬ ĐẶT XE CỦA BẠN",
      historySubtitle: "Danh sách các đơn đặt lái xe hộ D.GO đã thực hiện",
      noHistory: "Bạn chưa có đơn đặt xe nào trong lịch sử.",
      priceTableTitle: "BẢNG GIÁ DỊCH VỤ LÁI XE HỘ D.GO 247",
      close: "Đóng"
    },
    // Why Choose Us
    whyUs: {
      heading: "TẠI SAO HƠN 50.000+ KHÁCH HÀNG CHỌN D.GO?",
      subheading: "Dịch vụ đưa người và xe về nhà an toàn - Uy tín hàng đầu tại Việt Nam",
      reason1Title: "Đội Ngũ Tài Xế Chuyên Nghiệp",
      reason1Desc: "Tài xế trên 5 năm kinh nghiệm, lý lịch tư pháp rõ ràng, tác phong lịch sự, am hiểu mọi dòng xe từ phổ thông đến xe sang.",
      reason2Title: "Có Mặt Siêu Tốc 10 - 15 Phút",
      reason2Desc: "Hệ thống tự động điều phối tài xế gần nhất đến điểm đón khách hàng một cách nhanh chóng nhất.",
      reason3Title: "An Toàn & Tận Tâm",
      reason3Desc: "Cam kết lái xe cẩn thận, tận tụy và nâng niu xe của bạn như chính xe của chúng tôi trên suốt hành trình.",
      reason4Title: "Bảng Giá Minh Bạch & Cạnh Tranh",
      reason4Desc: "Cước phí được tự động tính toán chính xác trên ứng dụng trước khi đặt, không lo bị phát sinh chi phí ẩn."
    },
    // Dispatcher
    dispatcher: {
      title: "MÀN HÌNH QUẢN LÝ ĐƠN ĐẶT TÀI XẾ",
      subtitle: "Hệ thống điều hành theo dõi trạng thái đơn hàng thời gian thực",
      searchPlaceholder: "Tìm kiếm theo tên, SĐT, địa chỉ...",
      filterAll: "Tất cả đơn",
      filterPending: "Chờ tài xế",
      filterConfirmed: "Đã nhận đơn",
      filterInProgress: "Đang di chuyển",
      filterCompleted: "Hoàn thành",
      filterCancelled: "Đã hủy",
      noBookings: "Chưa có đơn đặt xe nào trong hệ thống."
    },
    // Common
    common: {
      callHotline: "Gọi Lái 24/7",
      chatZalo: "Chat Zalo",
      statusPending: "Đang chờ điều phối",
      statusConfirmed: "Tài xế đã nhận đơn",
      statusInProgress: "Đang di chuyển",
      statusCompleted: "Hoàn thành",
      statusCancelled: "Đã hủy"
    }
  },

  en: {
    // Header
    header: {
      sheets: "Google Sheets",
      priceTable: "Rates",
      history: "History",
      manageOrders: "Dispatch",
      zalo: "Zalo 24/7",
      hotlineTooltip: "Call hotline for quick booking"
    },
    // Hero Banner
    hero: {
      badgeTitle: "Leading Professional Designated Driver Service",
      badgeEta: "Arrives in 10-15 mins",
      mainTitle: "Enjoy Your Party – ",
      mainTitleHighlight: "D.GO Drives You Home Safely",
      description: "Book a personal driver for your car or motorbike to bring you and your vehicle home safely 24/7. Avoid DUI penalties and late-night driving fatigue.",
      feat1Title: "100% Safe",
      feat1Sub: "Experienced drivers",
      feat2Title: "24/7 Service",
      feat2Sub: "Day and night",
      feat3Title: "Transparent Fare",
      feat3Sub: "Know price upfront",
      feat4Title: "Safe Driving",
      feat4Sub: "Careful & responsible"
    },
    // Booking Form
    form: {
      title: "Book D.GO Designated Driver",
      subtitle: "Quick arrival within 10 - 15 minutes after confirmation",
      secCustomer: "1. Customer Information",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your name",
      phoneLabel: "Phone Number",
      phonePlaceholder: "Enter phone number (e.g., 0877683536)",
      secVehicle: "2. Vehicle Type & Service",
      hourlySelectLabel: "Rental Duration",
      secRoute: "3. Trip Route",
      pickupLabel: "Pickup Location",
      pickupPlaceholder: "Enter pickup address (e.g., 123 Nguyen Trai, Hanoi)",
      getGpsBtn: "Use My Current GPS Location",
      gettingGps: "Locating GPS...",
      destLabel: "Drop-off Location",
      destPlaceholder: "Enter destination address (e.g., Landmark 81, HCMC)",
      noteLabel: "Note for Driver",
      notePlaceholder: "E.g., Automatic Mazda CX5, driver bring helmet...",
      secTime: "4. Pickup Time",
      pickupNow: "Pickup Now (in 10-15 mins)",
      schedulePickup: "Schedule Pickup",
      vatCheck: "Issue VAT Invoice (Company)",
      companyName: "Company Name",
      companyNamePlaceholder: "Enter company name",
      taxCode: "Tax Code",
      taxCodePlaceholder: "Enter tax code",
      companyAddress: "Company Address",
      companyAddressPlaceholder: "Enter company address",
      vatEmail: "Invoice Email",
      vatEmailPlaceholder: "Enter email for e-invoice",
      liveTotalTitle: "Estimated Total Fare",
      calculatingRoute: "Recalculating...",
      hourlyRentalFor: "Hourly rental",
      roadDistance: "Driving distance:",
      estimatedDuration: "mins travel",
      enterAddressPrompt: "Please enter pickup and drop-off points to calculate fare",
      noVatNote: "Excluding VAT (Calculated automatically per rates)",
      submitBtn: "CONFIRM D.GO DRIVER BOOKING",
      submitting: "Processing...",
      autoMapTitle: "Map automatically finds optimal route"
    },
    // Vehicle types
    vehicle: {
      car4_7: "4-7 Seat Car",
      motorbike: "Motorbike",
      luxury: "Luxury / Pickup",
      hourly: "Hourly Rental"
    },
    // Summary Card
    summary: {
      title: "BOOKING FARE SUMMARY",
      routeSummary: "Trip Itinerary",
      from: "From:",
      to: "To:",
      vehicleType: "Vehicle Type:",
      distance: "Distance & Est Time:",
      basePrice: "Base Service Fee:",
      nightSurcharge: "Night Surcharge:",
      vatFee: "VAT Tax (8%):",
      totalEst: "ESTIMATED TOTAL FARE",
      noVatNote: "Fare excludes VAT (unless selected)",
      waitingFeeNoteTitle: "Note:",
      waitingFeeNoteBody: "Total amount excludes driver waiting fee (+60,000 VND/hour) and extra destination fees.",
      contactHotlineText: "(please contact hotline",
      contactHotlineSub: "for consultation)"
    },
    // Modals
    modals: {
      confirmBookingTitle: "CONFIRM D.GO DRIVER BOOKING",
      confirmSubtitle: "Please review your trip details carefully before sending",
      btnCancel: "Back to Edit",
      btnConfirm: "CONFIRM & SEND DRIVER REQUEST",
      historyTitle: "YOUR BOOKING HISTORY",
      historySubtitle: "List of your previous D.GO driver bookings",
      noHistory: "You have no previous booking history.",
      priceTableTitle: "D.GO 247 DESIGNATED DRIVER FARE TABLE",
      close: "Close"
    },
    // Why Choose Us
    whyUs: {
      heading: "WHY OVER 50,000+ CUSTOMERS TRUST D.GO?",
      subheading: "Safe driver & vehicle transport service - #1 in Vietnam",
      reason1Title: "Professional Drivers",
      reason1Desc: "Drivers with 5+ years experience, verified background, polite demeanor, skilled in driving luxury and standard vehicles.",
      reason2Title: "Super-Fast Arrival 10 - 15 Mins",
      reason2Desc: "Automated dispatching connects you to the nearest available driver instantly.",
      reason3Title: "Safe & Dedicated Driving",
      reason3Desc: "Committed to careful and attentive driving. Your vehicle is cared for like our own throughout the journey.",
      reason4Title: "Transparent & Competitive Rates",
      reason4Desc: "Fares are calculated upfront based on actual distance, with no hidden fees."
    },
    // Dispatcher
    dispatcher: {
      title: "DRIVER DISPATCH & ORDER MANAGEMENT",
      subtitle: "Real-time order monitoring and dispatch console",
      searchPlaceholder: "Search by name, phone, address...",
      filterAll: "All Orders",
      filterPending: "Pending Driver",
      filterConfirmed: "Accepted",
      filterInProgress: "In Progress",
      filterCompleted: "Completed",
      filterCancelled: "Cancelled",
      noBookings: "No bookings found in system."
    },
    // Common
    common: {
      callHotline: "Call 24/7",
      chatZalo: "Chat Zalo",
      statusPending: "Pending Dispatch",
      statusConfirmed: "Driver Assigned",
      statusInProgress: "In Transit",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled"
    }
  },

  zh: {
    // Header
    header: {
      sheets: "谷歌表格",
      priceTable: "价格表",
      history: "历史记录",
      manageOrders: "订单管理",
      zalo: "Zalo 客服",
      hotlineTooltip: "拨打热线快速预约"
    },
    // Hero Banner
    hero: {
      badgeTitle: "顶尖专业专属代驾服务",
      badgeEta: "10-15分钟内到达",
      mainTitle: "尽情聚会欢畅 – ",
      mainTitleHighlight: "D.GO 安全送您与爱车回家",
      description: "预约专职司机为您驾驶汽车或摩托车，24/7全天候安全送您及车辆回家。无需担心酒驾处罚或深夜疲劳驾驶。",
      feat1Title: "100% 安全",
      feat1Sub: "经验丰富老司机",
      feat2Title: "24/7 全天候",
      feat2Sub: "昼夜无休服务",
      feat3Title: "价格透明",
      feat3Sub: "事先明确费用",
      feat4Title: "安全驾驶",
      feat4Sub: "谨慎细致负责"
    },
    // Booking Form
    form: {
      title: "预约 D.GO 专属代驾",
      subtitle: "确认后 10 - 15 分钟内快速到达",
      secCustomer: "1. 客户信息",
      nameLabel: "客户姓名",
      namePlaceholder: "请输入您的姓名",
      phoneLabel: "联系电话",
      phonePlaceholder: "请输入电话号码 (例如: 0877683536)",
      secVehicle: "2. 选择车型与服务",
      hourlySelectLabel: "套餐租赁时长",
      secRoute: "3. 行程路线",
      pickupLabel: "接客地点",
      pickupPlaceholder: "输入接客地址 (例如: 123 Nguyen Trai, 河内)",
      getGpsBtn: "获取我的当前 GPS 位置",
      gettingGps: "正在获取GPS...",
      destLabel: "送达地点",
      destPlaceholder: "输入送达地址 (例如: Landmark 81, 胡志明市)",
      noteLabel: "给司机的备注",
      notePlaceholder: "例如：自动挡马自达CX5，司机需带头盔...",
      secTime: "4. 接送时间",
      pickupNow: "立即接送 (10-15分钟内)",
      schedulePickup: "预约接送时间",
      vatCheck: "开具增值税发票 (公司)",
      companyName: "公司名称",
      companyNamePlaceholder: "请输入公司名称",
      taxCode: "税号",
      taxCodePlaceholder: "请输入税号",
      companyAddress: "公司地址",
      companyAddressPlaceholder: "请输入公司地址",
      vatEmail: "发票接收邮箱",
      vatEmailPlaceholder: "请输入电子发票邮箱",
      liveTotalTitle: "预计总费用",
      calculatingRoute: "正在重新计算...",
      hourlyRentalFor: "包时租赁",
      roadDistance: "汽车行驶距离:",
      estimatedDuration: "分钟车程",
      enterAddressPrompt: "请输入接送地点以自动计算费用",
      noVatNote: "不含增值税 (按价格表自动计算)",
      submitBtn: "确认预约 D.GO 代驾",
      submitting: "正在处理...",
      autoMapTitle: "地图自动寻找最佳路线"
    },
    // Vehicle types
    vehicle: {
      car4_7: "4-7座轿车",
      motorbike: "摩托车",
      luxury: "豪车 / 皮卡",
      hourly: "按小时租赁"
    },
    // Summary Card
    summary: {
      title: "行程费用明细",
      routeSummary: "行程路线",
      from: "出发地:",
      to: "目的地:",
      vehicleType: "车辆类型:",
      distance: "行驶距离:",
      basePrice: "基础运费:",
      nightSurcharge: "夜间附加费 (22:00 - 06:00):",
      vatFee: "增值税 (10%):",
      totalEst: "预计总费用",
      noVatNote: "不含增值税",
      waitingFeeNoteTitle: "等待费及途中停靠提示：",
      waitingFeeNoteBody: "以上价格不含司机等候费 (+60,000 越南盾/小时)。途中增加停靠点将产生额外费用。",
      contactHotlineText: "请联系热线",
      contactHotlineSub: "获取详细咨询。"
    },
    // Modals
    modals: {
      confirmBookingTitle: "确认 D.GO 代驾订单",
      confirmSubtitle: "发送前请仔细核对您的行程信息",
      btnCancel: "返回修改",
      btnConfirm: "确认并发送代驾请求",
      historyTitle: "您的预约历史",
      historySubtitle: "您过往的 D.GO 代驾预约记录",
      noHistory: "您暂无预约历史记录。",
      priceTableTitle: "D.GO 247 代驾服务价格表",
      close: "关闭"
    },
    // Why Choose Us
    whyUs: {
      heading: "为什么超过 50,000+ 客户选择 D.GO？",
      subheading: "人车安全送达服务 - 越南第一品牌",
      reason1Title: "专业司机团队",
      reason1Desc: "5年以上驾龄，无犯罪记录，礼貌专业，熟悉从普通车到豪华车的各类车型。",
      reason2Title: "10-15分钟极速到达",
      reason2Desc: "智能派单系统快速匹配离您最近的司机前往接送。",
      reason3Title: "安全与用心服务",
      reason3Desc: "承诺谨慎且用心地驾驶，像对待自己的车一样爱护您的车辆。",
      reason4Title: "价格透明具竞争力",
      reason4Desc: "预约前根据实际距离自动精确计算费用，无隐藏收费。"
    },
    // Dispatcher
    dispatcher: {
      title: "代驾派单与订单管理 console",
      subtitle: "实时监控订单状态与派单控制台",
      searchPlaceholder: "按姓名、电话、地址搜索...",
      filterAll: "全部订单",
      filterPending: "等待司机",
      filterConfirmed: "已接单",
      filterInProgress: "进行中",
      filterCompleted: "已完成",
      filterCancelled: "已取消",
      noBookings: "系统中未找到订单。"
    },
    // Common
    common: {
      callHotline: "24/7 电话",
      chatZalo: "Zalo 咨询",
      statusPending: "等待派单",
      statusConfirmed: "司机已接单",
      statusInProgress: "行程中",
      statusCompleted: "已完成",
      statusCancelled: "已取消"
    }
  },

  ja: {
    // Header
    header: {
      sheets: "Googleスプレッドシート",
      priceTable: "料金表",
      history: "利用履歴",
      manageOrders: "配車管理",
      zalo: "Zalo 24/7",
      hotlineTooltip: "ホットラインでお電話"
    },
    // Hero Banner
    hero: {
      badgeTitle: "トップクラスのプロ代行運転サービス",
      badgeEta: "10〜15分で到着",
      mainTitle: "宴会を心ゆくまで – ",
      mainTitleHighlight: "D.GOが安全にご自宅まで運転",
      description: "お車やバイクをご自宅まで安全に代行運転いたします（24時間365日対応）。飲酒運転の罰則や深夜の疲労運転の心配はありません。",
      feat1Title: "100% 安全",
      feat1Sub: "熟練ドライバー",
      feat2Title: "24時間対応",
      feat2Sub: "昼夜問わず",
      feat3Title: "明朗会計",
      feat3Sub: "事前金額提示",
      feat4Title: "安全運転",
      feat4Sub: "丁寧＆責任感"
    },
    // Booking Form
    form: {
      title: "D.GO代行運転の予約",
      subtitle: "予約確定後10〜15分で迅速にお迎え",
      secCustomer: "1. お客様情報",
      nameLabel: "お名前",
      namePlaceholder: "お名前を入力してください",
      phoneLabel: "電話番号",
      phonePlaceholder: "電話番号を入力 (例: 0877683536)",
      secVehicle: "2. 車種＆サービス選択",
      hourlySelectLabel: "レンタルプラン時間",
      secRoute: "3. 運行ルート",
      pickupLabel: "お迎え場所",
      pickupPlaceholder: "お迎え先住所を入力 (例: 123 Nguyen Trai, Hanoi)",
      getGpsBtn: "現在地のGPS位置を取得",
      gettingGps: "GPS位置情報を取得中...",
      destLabel: "目的地（降車場所）",
      destPlaceholder: "目的地住所を入力 (例: Landmark 81, HCMC)",
      noteLabel: "ドライバーへのメモ",
      notePlaceholder: "例: AT車のマツダCX5、ヘルメット持参...",
      secTime: "4. お迎え時間",
      pickupNow: "今すぐお迎え (10〜15分以内)",
      schedulePickup: "時間を指定して予約",
      vatCheck: "VAT領収書（法人）を発行",
      companyName: "会社名",
      companyNamePlaceholder: "会社名を入力",
      taxCode: "納税者番号",
      taxCodePlaceholder: "納税者番号を入力",
      companyAddress: "会社住所",
      companyAddressPlaceholder: "会社住所を入力",
      vatEmail: "領収書送信先Email",
      vatEmailPlaceholder: "電子領収書受け取り用メールアドレス",
      liveTotalTitle: "概算合計金額",
      calculatingRoute: "再計算中...",
      hourlyRentalFor: "時間制レンタル",
      roadDistance: "走行距離:",
      estimatedDuration: "分（所要時間）",
      enterAddressPrompt: "お迎え場所と目的地を入力すると自動計算されます",
      noVatNote: "VAT別 (料金表に基づき自動計算)",
      submitBtn: "D.GOドライバー予約を確定",
      submitting: "処理中...",
      autoMapTitle: "マップが最適なルートを自動検索"
    },
    // Vehicle types
    vehicle: {
      car4_7: "4-7人乗り乗用車",
      motorbike: "バイク",
      luxury: "高级車 / ピックアップ",
      hourly: "時間制レンタル"
    },
    // Summary Card
    summary: {
      title: "料金見積もりサマリー",
      routeSummary: "運行ルート",
      from: "出発地:",
      to: "目的地:",
      vehicleType: "車種:",
      distance: "走行距離:",
      basePrice: "基本料金:",
      nightSurcharge: "深夜割増 (22:00 - 06:00):",
      vatFee: "VAT税 (10%):",
      totalEst: "概算合計金額",
      noVatNote: "VAT別",
      waitingFeeNoteTitle: "待機料金および経由地に関するご注意：",
      waitingFeeNoteBody: "上記料金にドライバーの待機時間は含まれていません（+60,000 VND/時間）。経由地が追加される場合は別途料金が発生します。",
      contactHotlineText: "詳細についてはホットライン",
      contactHotlineSub: "までお気軽にお問い合わせください。"
    },
    // Modals
    modals: {
      confirmBookingTitle: "D.GO代行予約内容の確認",
      confirmSubtitle: "送信前に運行ルートと内容をご確認ください",
      btnCancel: "修正に戻る",
      btnConfirm: "確定してドライバー手配を送信",
      historyTitle: "ご利用履歴",
      historySubtitle: "過去のD.GO代行運転の利用履歴",
      noHistory: "利用履歴はありません。",
      priceTableTitle: "D.GO 247 代行運転サービス料金表",
      close: "閉じる"
    },
    // Why Choose Us
    whyUs: {
      heading: "50,000人以上のお客様に選ばれる理由",
      subheading: "人とお車を安全にご自宅までお届け - ベトナムNo.1信頼実績",
      reason1Title: "プロのドライバー陣",
      reason1Desc: "運転歴5年以上の経験豊富なドライバー。丁寧なマナーで一般車から高級車まで幅広く対応。",
      reason2Title: "10〜15分の爆速到着",
      reason2Desc: "自動配車システムにより、一番近くにいるドライバーがすぐに向かいます。",
      reason3Title: "安全で丁寧な運転",
      reason3Desc: "丁寧で慎重な運転をお約束。お客様のお車を大切にお取り扱いします。",
      reason4Title: "明朗で競争力のある料金",
      reason4Desc: "予約前にアプリ上で距離に応じた正確な料金を提示。隠れた追加費用はありません。"
    },
    // Dispatcher
    dispatcher: {
      title: "配車＆注文管理コンソール",
      subtitle: "リアルタイムの注文ステータス監視画面",
      searchPlaceholder: "名前、電話番号、住所で検索...",
      filterAll: "すべての注文",
      filterPending: "ドライバー待ち",
      filterConfirmed: "受注済み",
      filterInProgress: "移動中",
      filterCompleted: "完了",
      filterCancelled: "キャンセル",
      noBookings: "注文データはありません。"
    },
    // Common
    common: {
      callHotline: "24時間電話",
      chatZalo: "Zalo チャット",
      statusPending: "配車待ち",
      statusConfirmed: "ドライバー手配完了",
      statusInProgress: "移動中",
      statusCompleted: "完了",
      statusCancelled: "キャンセル済み"
    }
  },

  ko: {
    // Header
    header: {
      sheets: "구글 시트",
      priceTable: "요금표",
      history: "이용 내역",
      manageOrders: "기사/주문 관리",
      zalo: "Zalo 24/7",
      hotlineTooltip: "빠른 예약을 위한 핫라인 전화"
    },
    // Hero Banner
    hero: {
      badgeTitle: "최고급 전문 대리운전 서비스",
      badgeEta: "10-15분 내 도착",
      mainTitle: "즐거운 모임 후 – ",
      mainTitleHighlight: "D.GO가 안전하게 집까지 모십니다",
      description: "고객님의 승용차 및 오토바이를 집까지 안전하게 대리운전해 드립니다 (24시간 연중무휴). 음주운전 단속 및 야간 피로 운전 걱정 끝.",
      feat1Title: "100% 안전",
      feat1Sub: "숙련된 베테랑 기사",
      feat2Title: "24시간 서비스",
      feat2Sub: "낮이나 밤이나",
      feat3Title: "투명한 요금",
      feat3Sub: "사전 금액 확인",
      feat4Title: "안전 운전",
      feat4Sub: "신중함과 책임감"
    },
    // Booking Form
    form: {
      title: "D.GO 대리운전 예약",
      subtitle: "예약 확정 후 10~15분 이내 신속 도착",
      secCustomer: "1. 고객 정보",
      nameLabel: "성함",
      namePlaceholder: "성함을 입력해 주세요",
      phoneLabel: "연락처",
      phonePlaceholder: "전화번호 입력 (예: 0877683536)",
      secVehicle: "2. 차종 및 서비스 선택",
      hourlySelectLabel: "대여 패키지 시간",
      secRoute: "3. 운행 경로",
      pickupLabel: "출발지 (승차 장소)",
      pickupPlaceholder: "출발지 주소 입력 (예: 123 Nguyen Trai, 하노이)",
      getGpsBtn: "내 현재 GPS 위치 가져오기",
      gettingGps: "GPS 위치 확인 중...",
      destLabel: "도착지 (하차 장소)",
      destPlaceholder: "도착지 주소 입력 (예: Landmark 81, 호치민)",
      noteLabel: "기사님께 전달할 메모",
      notePlaceholder: "예: 오토 마츠다 CX5, 기사님 헬멧 지참...",
      secTime: "4. 출발 시간",
      pickupNow: "지금 바로 출발 (10-15분 내)",
      schedulePickup: "출발 시간 지정 예약",
      vatCheck: "VAT 세금계산서 발행 (법인)",
      companyName: "회사명",
      companyNamePlaceholder: "회사명 입력",
      taxCode: "사업자 등록번호",
      taxCodePlaceholder: "사업자번호 입력",
      companyAddress: "회사 주소",
      companyAddressPlaceholder: "회사 주소 입력",
      vatEmail: "계산서 수신 이메일",
      vatEmailPlaceholder: "전자세금계산서 이메일 주소",
      liveTotalTitle: "예상 총 요금",
      calculatingRoute: "재계산 중...",
      hourlyRentalFor: "시간제 대여",
      roadDistance: "운행 거리:",
      estimatedDuration: "분 소요",
      enterAddressPrompt: "출발지와 도착지를 입력하시면 요금이 자동 계산됩니다",
      noVatNote: "VAT 별도 (요금표 기준 자동 계산)",
      submitBtn: "D.GO 기사 예약 확정",
      submitting: "처리 중...",
      autoMapTitle: "지도 최적 경로 자동 탐색"
    },
    // Vehicle types
    vehicle: {
      car4_7: "4-7인승 승용차",
      motorbike: "오토바이",
      luxury: "고급차 / 픽업트럭",
      hourly: "시간제 대여"
    },
    // Summary Card
    summary: {
      title: "예상 요금 요약",
      routeSummary: "운행 경로",
      from: "출발:",
      to: "도착:",
      vehicleType: "차종:",
      distance: "운행 거리:",
      basePrice: "기본 요금:",
      nightSurcharge: "심야 할증 (22:00 - 06:00):",
      vatFee: "VAT 세금 (10%):",
      totalEst: "예상 총 금액",
      noVatNote: "VAT 별도",
      waitingFeeNoteTitle: "대기 시간 및 경유지 유의사항:",
      waitingFeeNoteBody: "상기 요금에는 기사 대기 시간이 포함되어 있지 않습니다 (+60,000 VND/시간). 경유지 추가 시 추가 요금이 발생합니다.",
      contactHotlineText: "자세한 사항은 핫라인",
      contactHotlineSub: "으로 문의해 주세요."
    },
    // Modals
    modals: {
      confirmBookingTitle: "D.GO 대리운전 예약 확인",
      confirmSubtitle: "전송 전 운행 정보를 다시 한번 확인해 주세요",
      btnCancel: "수정하러 가기",
      btnConfirm: "확정 및 대리운전 요청 전송",
      historyTitle: "이용 내역",
      historySubtitle: "고객님의 이전 D.GO 대리운전 이용 내역",
      noHistory: "이용 내역이 없습니다.",
      priceTableTitle: "D.GO 247 대리운전 서비스 요금표",
      close: "닫기"
    },
    // Why Choose Us
    whyUs: {
      heading: "50,000명 이상의 고객이 D.GO를 선택한 이유",
      subheading: "고객과 차량을 안전하게 모시는 베트남 No.1 대리운전",
      reason1Title: "전문 기사단",
      reason1Desc: "5년 이상 경력의 신원 검증된 베테랑 기사. 매너와 친절함으로 일반 차부터 고급차까지 정성껏 운전합니다.",
      reason2Title: "10-15분 초스피드 도착",
      reason2Desc: "자동 배차 시스템으로 가장 가까운 위치의 기사가 즉시 출동합니다.",
      reason3Title: "안전하고 세심한 운전",
      reason3Desc: "신중하고 세심한 운전을 약속하며, 고객님의 차량을 내 차처럼 아낍니다.",
      reason4Title: "투명하고 합리적인 요금",
      reason4Desc: "실제 거리에 따라 앱에서 사전에 정확한 요금을 계산하여 숨은 추가 비용이 없습니다."
    },
    // Dispatcher
    dispatcher: {
      title: "기사 배차 및 주문 관리",
      subtitle: "실시간 주문 상태 모니터링 및 배차 콘솔",
      searchPlaceholder: "이름, 전화번호, 주소 검색...",
      filterAll: "전체 주문",
      filterPending: "기사 대기 중",
      filterConfirmed: "수락됨",
      filterInProgress: "운행 중",
      filterCompleted: "완료",
      filterCancelled: "취소됨",
      noBookings: "시스템에 등록된 주문이 없습니다."
    },
    // Common
    common: {
      callHotline: "24시간 전화",
      chatZalo: "Zalo 상담",
      statusPending: "배차 대기 중",
      statusConfirmed: "기사 배정 완료",
      statusInProgress: "운행 중",
      statusCompleted: "완료",
      statusCancelled: "취소됨"
    }
  }
};
