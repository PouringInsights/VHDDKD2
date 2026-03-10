import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchLeaderboard, saveScore } from './supabase'

/* ─── PALETTE ─────────────────────────────────────────────────────────────── */
const C = {
  bg: '#0b0f1a', panel: '#111827', card: '#162033',
  border: 'rgba(255,255,255,0.07)',
  teal: '#2dd4bf', gold: '#f4c542', rose: '#f25f7a', sage: '#6ee7b7',
  muted: 'rgba(200,215,235,0.45)', text: '#dce8f5',
}

/* ─── QUIZ DATA — từ tài liệu gốc ─────────────────────────────────────────── */
const QUIZ = [
  { cat: 'Điền vào chỗ trống', q: 'Văn hoá kinh doanh quốc tế là tập hợp các giá trị, chuẩn mực, ___ được thể hiện trong cách ___ của chủ thể kinh doanh với xã hội, tự nhiên, cộng đồng.', opts: ['Các quy tắc; giao tiếp', 'Các quan niệm và hành vi; ứng xử', 'Hành vi; hoạt động', 'Quy tắc; hoạt động'], correct: 1, explain: 'Văn hoá kinh doanh quốc tế là tập hợp các giá trị, chuẩn mực, các quan niệm và hành vi được thể hiện trong cách ứng xử của chủ thể kinh doanh.' },
  { cat: 'Khái niệm', q: 'Văn hóa kinh doanh quốc tế là sự giao thoa và kết hợp giữa điều gì?', opts: ['Văn hoá kinh doanh của các tỉnh thành khác nhau trong một quốc gia', 'Văn hoá kinh doanh của các quốc gia khác nhau với đặc trưng riêng của môi trường kinh doanh', 'Tạo nên hệ thống quy tắc ứng xử trong hoạt động thương mại trong nước', 'Tạo nên hệ thống quy tắc ứng xử trong các hoạt động văn hoá quốc tế'], correct: 1, explain: 'Văn hóa kinh doanh quốc tế là sự giao thoa và kết hợp giữa văn hóa kinh doanh của các quốc gia khác nhau với những đặc trưng riêng biệt của môi trường kinh doanh, tạo nên hệ thống quy tắc ứng xử trong thương mại quốc tế.' },
  { cat: 'Rủi ro văn hóa', q: '___ tăng lên dưới tác động của định hướng vị chủng — khuynh hướng coi các giá trị văn hóa của mình là chuẩn mực để đánh giá các văn hóa khác.', opts: ['Chuẩn mực văn hoá', 'Rủi ro văn hoá', 'Mâu thuẫn văn hoá', 'Đa dạng văn hoá'], correct: 1, explain: 'Rủi ro văn hóa tăng lên dưới tác động của định hướng vị chủng — khuynh hướng nhìn văn hóa khác dưới lăng kính của nền văn hóa đất nước mình.' },
  { cat: 'Vai trò VHKDQT', q: 'Giúp nhân viên hiểu rõ hơn về cách thức giao tiếp và làm việc của đồng nghiệp từ các nền văn hoá khác nhau — phản ánh vai trò nào của văn hoá kinh doanh quốc tế?', opts: ['Tăng cường hiệu quả làm việc trong môi trường đa văn hoá', 'Nâng cao hiệu quả tuyển dụng nhân sự', 'Nâng cao hiệu quả vận hành cơ cấu tổ chức', 'Nâng cao chất lượng dịch vụ khách hàng'], correct: 0, explain: 'Trong môi trường đa văn hoá, hiểu biết và giao tiếp là then chốt. IBM đã triển khai chương trình đào tạo giúp các đội nhóm đa quốc gia hợp tác hiệu quả hơn.' },
  { cat: 'Vai trò VHKDQT', q: 'Văn hoá kinh doanh quốc tế giúp nâng cao hiệu quả tuyển dụng nhân sự bằng cách nào?', opts: ['Quản lý xung đột bằng cách cung cấp công cụ và kỹ năng cần thiết', 'Khuyến khích hợp tác và chia sẻ kiến thức giữa nhân viên đa văn hoá', 'Thu hút tài năng toàn cầu, cải thiện quy trình tuyển dụng', 'Giúp nhân viên nhận thức và phục vụ khách hàng hiệu quả hơn'], correct: 2, explain: 'Văn hoá kinh doanh quốc tế giúp nâng cao hiệu quả tuyển dụng: thu hút tài năng toàn cầu, cải thiện quy trình tuyển dụng, tạo môi trường làm việc đa dạng và giảm chi phí tuyển dụng.' },
  { cat: 'Cơ cấu tổ chức', q: 'Các công ty ___ khuyến khích trao quyền cho nhân viên cấp dưới, hình thành cấu trúc phân cấp, giúp giảm tính quan liêu và tăng sự năng động.', opts: ['Châu Á', 'Châu Phi', 'Bắc Âu', 'Nam Mỹ'], correct: 2, explain: 'Các công ty Bắc Âu khuyến khích trao quyền cho nhân viên cấp dưới. Ngược lại, các doanh nghiệp châu Á thường có giám đốc là người nắm quyền quyết định tối cao.' },
  { cat: 'Dịch vụ khách hàng', q: 'Nâng cao chất lượng dịch vụ khách hàng là một trong các ___ của văn hoá kinh doanh quốc tế.', opts: ['Kết quả', 'Vai trò', 'Lưu ý', 'Đặc trưng'], correct: 1, explain: 'Nâng cao chất lượng dịch vụ khách hàng là một trong các vai trò của văn hoá kinh doanh quốc tế. Văn hóa Nhật Bản coi khách hàng là thượng đế — được chào đón và cảm ơn ngay từ cửa vào.' },
  { cat: 'Chuyển đổi số', q: 'Văn hóa là ___ số một trong chuyển đổi số.', opts: ['Rào cản', 'Điều kiện', 'Yếu tố', 'Thành phần'], correct: 0, explain: 'Văn hóa là rào cản số một trong chuyển đổi số. Văn hóa mạnh có liên quan đến hiệu suất cao, nhưng cũng có thể trở thành rào cản thay đổi và là nguyên nhân hàng đầu khiến các sáng kiến chuyển đổi số thất bại.' },
  { cat: 'Chuyển đổi số', q: '___ là quá trình ứng dụng công nghệ thông tin và truyền thông để thay đổi cách thức kinh doanh, tạo ra các mô hình kinh doanh mới, cải thiện hiệu suất và tăng cường cạnh tranh.', opts: ['Văn hoá số', 'Chuyển đổi số', 'Kinh doanh số', 'Văn hoá kinh doanh'], correct: 1, explain: 'Chuyển đổi số là quá trình ứng dụng CNTT và truyền thông để thay đổi cách thức kinh doanh, tạo mô hình kinh doanh mới, cải thiện hiệu suất và tăng cường cạnh tranh.' },
  { cat: 'Văn hóa số', q: '___ được coi là động lực chính đằng sau văn hóa kinh doanh số, cũng như các công cụ được áp dụng phổ biến trong công tác quản trị.', opts: ['Văn hoá', 'Triết lý', 'Nhà lãnh đạo', 'Công nghệ'], correct: 3, explain: 'Công nghệ được coi là động lực chính đằng sau văn hóa kinh doanh số — đây là sự khác biệt chính giữa văn hóa kinh doanh thông thường và văn hóa kinh doanh số.' },
  { cat: 'Đúng hay Sai?', q: 'Giao lưu văn hóa được hiểu là những tình huống trong đó việc truyền đạt SAI LỆCH về văn hóa có thể gây ra hiểu nhầm nghiêm trọng giữa các đối tác từ những nền văn hóa khác nhau.', opts: ['Đúng', 'Sai — đó là định nghĩa của RỦI RO VĂN HÓA, không phải giao lưu văn hóa'], correct: 1, explain: 'SAI. Đây là định nghĩa của RỦI RO VĂN HÓA. Giao lưu văn hóa là sự tiếp xúc và trao đổi qua lại những giá trị văn hoá giữa hai hay nhiều nền văn hoá khác nhau.' },
  { cat: 'Đúng hay Sai?', q: 'Rủi ro văn hóa tăng lên dưới tác động của định hướng đa tâm và định hướng toàn cầu.', opts: ['Đúng', 'Sai — rủi ro văn hóa tăng dưới tác động của định hướng VỊ CHỦNG'], correct: 1, explain: 'SAI. Rủi ro văn hóa tăng lên dưới tác động của ĐỊNH HƯỚNG VỊ CHỦNG. Định hướng đa tâm và toàn cầu chính là giải pháp để GIẢM thiểu rủi ro văn hóa.' },
  { cat: 'Đúng hay Sai?', q: 'Giao tiếp là yếu tố cốt lõi trong văn hóa kinh doanh quốc tế và chỉ bao gồm giao tiếp ngôn ngữ.', opts: ['Đúng', 'Sai — giao tiếp bao gồm cả ngôn ngữ và PHI ngôn ngữ'], correct: 1, explain: 'SAI. Giao tiếp bao gồm cả giao tiếp ngôn ngữ VÀ phi ngôn ngữ (cử chỉ, nét mặt, khoảng cách cá nhân, ánh mắt, sự im lặng).' },
  { cat: 'Đúng hay Sai?', q: 'McDonald\'s điều chỉnh thực đơn tại Ấn Độ (loại bỏ thịt bò, bổ sung McAloo Tikki Burger) là biểu hiện của sự giao lưu và biến đổi trong văn hóa kinh doanh quốc tế.', opts: ['Đúng', 'Sai'], correct: 0, explain: 'ĐÚNG. Đây là ví dụ điển hình về sự thích nghi văn hóa — McDonald\'s điều chỉnh thực đơn để phù hợp với văn hóa ẩm thực và tôn giáo của người Ấn Độ.' },
  { cat: 'Đúng hay Sai?', q: 'Intel tổ chức hội thảo "Làm việc với Ấn Độ" cho nhân viên tại thung lũng Silicon là ví dụ về đào tạo kỹ năng thích ứng môi trường đa văn hóa.', opts: ['Đúng', 'Sai'], correct: 0, explain: 'ĐÚNG. Intel tổ chức hội thảo để nhân viên làm việc hiệu quả hơn với lượng lớn công dân Ấn Độ tại thung lũng Silicon.' },
  { cat: 'Đúng hay Sai?', q: 'Các nhà quản trị trong môi trường kinh doanh quốc tế cần thực hiện khuynh hướng vị chủng trong các quyết định của mình.', opts: ['Đúng', 'Sai — cần TRÁNH vị chủng, áp dụng định hướng đa tâm và toàn cầu'], correct: 1, explain: 'SAI. Các nhà quản trị cần TRÁNH khuynh hướng vị chủng bằng việc áp dụng định hướng đa tâm và định hướng toàn cầu.' },
  { cat: 'Đặc trưng VHKDQT', q: 'Ở Nhật Bản, im lặng trong đàm phán kinh doanh thể hiện điều gì?', opts: ['Sự thiếu tự tin, cần được hỗ trợ', 'Sự suy nghĩ cẩn trọng — là một phần của giao tiếp', 'Không đồng ý với đề xuất', 'Muốn kết thúc cuộc họp sớm'], correct: 1, explain: 'Ở Nhật Bản, im lặng trong đàm phán được coi là một phần của giao tiếp và thể hiện sự suy nghĩ cẩn trọng. Ngược lại, ở Mỹ, im lặng có thể bị hiểu là thiếu tự tin.' },
  { cat: 'Đặc trưng VHKDQT', q: 'Phong cách lãnh đạo tại các nước Bắc Âu (như Thụy Điển) thường là gì?', opts: ['Chỉ huy, quyết đoán từ trên xuống', 'Tập trung quyền lực, dựa vào lòng trung thành', 'Dân chủ, có sự tham gia quyết định của nhân viên ở mọi cấp', 'Gia trưởng, đề cao quan hệ gia đình'], correct: 2, explain: 'Ở các nước Bắc Âu như Thụy Điển, phong cách lãnh đạo dân chủ được ưa chuộng, với sự tham gia quyết định của nhân viên ở mọi cấp. Tại Trung Quốc và Hàn Quốc, phong cách lãnh đạo thường tập trung quyền lực cao.' },
  { cat: 'Văn hóa số', q: 'Theo báo cáo của BCG (2021), các công ty có văn hóa đổi mới mạnh có tỷ suất lợi nhuận cao hơn bao nhiêu % so với trung bình ngành?', opts: ['10%', '20%', '30%', '40%'], correct: 2, explain: 'Báo cáo của BCG (2021) chỉ ra rằng các công ty có văn hóa đổi mới mạnh có tỷ suất lợi nhuận cao hơn 30% so với trung bình ngành.' },
  { cat: 'Văn hóa số', q: 'Theo Harvard Business Review (2020), công ty có chiến lược lấy khách hàng làm trọng tâm có doanh thu tăng trưởng cao hơn bao nhiêu lần so với đối thủ?', opts: ['1,5 lần', '2,5 lần', '3,5 lần', '4 lần'], correct: 1, explain: 'Theo Harvard Business Review (2020), 80% công ty có chiến lược lấy khách hàng làm trọng tâm có doanh thu tăng trưởng cao hơn 2,5 lần so với đối thủ. Amazon là ví dụ điển hình.' },
]

/* ─── TÌNH HUỐNG ───────────────────────────────────────────────────────────── */
const SCENARIOS = [
  {
    title: 'Cuộc họp bị trễ',
    context: 'Coca-Cola cử đội sang Ấn Độ. Khi tổ chức các cuộc họp, đối tác Ấn Độ thường đến trễ 15–30 phút mà không có lời xin lỗi, khiến đội của ông John cảm thấy không thoải mái và thất vọng.',
    question: 'Ông John nên làm gì để giải quyết vấn đề này?',
    options: [
      { text: 'Bày tỏ thẳng thắn rằng người Mỹ coi trọng đúng giờ và yêu cầu đối tác thay đổi', type: 'bad', pts: 0, explain: 'Đây là biểu hiện của định hướng vị chủng — áp đặt chuẩn mực văn hóa Mỹ lên đối tác Ấn Độ. Điều này sẽ gây tổn thương mối quan hệ và cản trở hợp tác.' },
      { text: 'Điều chỉnh lịch họp sang buổi chiều khi đối tác Ấn Độ có nhiều thời gian hơn', type: 'best', pts: 100, explain: 'Đây chính xác là giải pháp ông John đã chọn trong câu chuyện — áp dụng định hướng đa tâm, thích nghi với văn hóa địa phương.' },
      { text: 'Báo cáo về trụ sở Mỹ rằng đối tác Ấn Độ không chuyên nghiệp', type: 'bad', pts: 0, explain: 'Đây là định hướng vị chủng điển hình. Người Ấn Độ có quan điểm linh hoạt về thời gian — đây là đặc trưng văn hóa, không phải sự thiếu chuyên nghiệp.' },
      { text: 'Im lặng chấp nhận nhưng không tìm hiểu nguyên nhân văn hóa', type: 'okay', pts: 40, explain: 'Tránh được xung đột nhưng không giải quyết gốc rễ vấn đề. Thiếu đi sự hiểu biết chủ động về văn hóa địa phương.' },
    ],
  },
  {
    title: 'Người em trai bất ngờ',
    context: 'Khi tổ chức một cuộc họp quan trọng, ông John bị sốc khi đối tác Ấn Độ mời em trai đến tham gia mà không thông báo trước. Người này tham gia vào cuộc họp như thể là một thành viên quan trọng của công ty.',
    question: 'Ông John nên xử lý tình huống này như thế nào?',
    options: [
      { text: 'Hỏi thẳng lý do tại sao có thêm người mà không thông báo trước', type: 'bad', pts: 0, explain: 'Ở Ấn Độ, kinh doanh thường gắn chặt với quan hệ gia đình và cộng đồng. Phản ứng này thể hiện sự thiếu hiểu biết về văn hóa kinh doanh địa phương.' },
      { text: 'Tiếp tục họp bình thường và xem người em trai như một thành viên hợp lệ', type: 'best', pts: 100, explain: 'Đây là cách ứng xử phù hợp nhất — hiểu rằng văn hóa kinh doanh Ấn Độ coi trọng quan hệ gia đình và cộng đồng.' },
      { text: 'Chỉ nói chuyện với đối tác chính, lịch sự bỏ qua người em', type: 'okay', pts: 40, explain: 'Không gây xung đột trực tiếp nhưng bỏ lỡ cơ hội xây dựng quan hệ. Đối tác có thể nhận ra sự phân biệt đối xử này.' },
      { text: 'Đề nghị hoãn họp để có thời gian chuẩn bị tài liệu cho đúng số người tham dự', type: 'okay', pts: 50, explain: 'Phản ứng an toàn nhưng không tận dụng được cơ hội xây dựng quan hệ tốt đẹp.' },
    ],
  },
  {
    title: 'Bài học quan trọng nhất',
    context: 'Sau các sự cố, ông John nhận ra rằng việc áp dụng nguyên tắc và chiến lược kinh doanh thành công ở Mỹ không đảm bảo thành công tại Ấn Độ. Ông cần thay đổi cách tiếp cận.',
    question: 'Điều gì là quan trọng nhất ông John cần làm để thành công tại Ấn Độ?',
    options: [
      { text: 'Yêu cầu đối tác Ấn Độ thích nghi theo cách làm việc của người Mỹ', type: 'bad', pts: 0, explain: 'Đây là định hướng vị chủng — áp đặt văn hóa của mình là sai lầm cơ bản trong kinh doanh quốc tế.' },
      { text: 'Hiểu và thích nghi với phong tục, tập quán và giá trị của nền văn hóa Ấn Độ', type: 'best', pts: 100, explain: 'Đúng theo tài liệu: đòi hỏi ông John và đội ngũ phải hiểu và thích nghi với các phong tục, tập quán và giá trị của nền văn hóa Ấn Độ để tránh mâu thuẫn và tìm được tiếng nói chung.' },
      { text: 'Thuê người Ấn Độ làm đại diện và không cần tìm hiểu thêm về văn hóa', type: 'okay', pts: 30, explain: 'Có thể giúp phần nào nhưng không đủ. Bản thân đội ngũ quản lý cũng cần hiểu văn hóa địa phương.' },
      { text: 'Chỉ tập trung vào các điều khoản hợp đồng, không cần quan tâm đến văn hóa', type: 'bad', pts: 0, explain: 'Sai lầm nghiêm trọng. Văn hóa tác động tới mọi trao đổi và quyết định trong kinh doanh.' },
    ],
  },
]

const AVS = ['🧑‍💼', '👩‍💼', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍💻', '👩‍💻', '🦁']

export default function App() {
  const [screen, setScreen] = useState('home')
  const [pendingMode, setPending] = useState('')
  const [player, setPlayer] = useState({ name: '', av: AVS[0] })
  const [nameVal, setNameVal] = useState('')
  const [pickedAv, setPickedAv] = useState(AVS[0])

  // Quiz
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [fastest, setFastest] = useState(99)
  const [chosen, setChosen] = useState(null)
  const [showFb, setShowFb] = useState(false)
  const [timeLeft, setTimeLeft] = useState(20)
  const timerRef = useRef(null)
  const startTime = useRef(null)

  // Scenario
  const [si, setSi] = useState(0)
  const [scScore, setScScore] = useState(0)
  const [scPicked, setScPicked] = useState(null)
  const [scShowFb, setScShowFb] = useState(false)

  // Leaderboard
  const [lb, setLb] = useState([])
  const [lbLoading, setLbLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [comboFlash, setComboFlash] = useState(false)

  const loadLb = async () => {
    setLbLoading(true)
    const data = await fetchLeaderboard()
    setLb(data)
    setLbLoading(false)
  }

  useEffect(() => { if (screen === 'lb') loadLb() }, [screen])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // Timer
  const stopTimer = () => clearInterval(timerRef.current)
  const startTimer = () => {
    stopTimer(); setTimeLeft(20); startTime.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return t - 1
      })
    }, 1000)
  }
  useEffect(() => { if (screen === 'quiz') startTimer(); return stopTimer }, [qi, screen])

  const handleTimeout = () => { setChosen(-1); setShowFb(true); setCombo(0) }

  const pickAnswer = (idx) => {
    if (chosen !== null) return
    stopTimer()
    const elapsed = (Date.now() - startTime.current) / 1000
    const q = QUIZ[qi]
    setChosen(idx); setShowFb(true)
    if (idx === q.correct) {
      const bonus = Math.max(0, Math.round((20 - elapsed) * 5))
      const pts = 50 + bonus
      const nc = combo + 1, nm = Math.max(maxCombo, nc)
      setScore(s => s + pts); setCombo(nc); setMaxCombo(nm); setCorrectCount(c => c + 1)
      if (elapsed < fastest) setFastest(Math.round(elapsed))
      if (nc >= 3) { setComboFlash(true); setTimeout(() => setComboFlash(false), 900) }
    } else { setCombo(0) }
  }

  const nextQ = () => {
    setChosen(null); setShowFb(false)
    if (qi + 1 >= QUIZ.length) endGame('quiz')
    else setQi(q => q + 1)
  }

  const pickScenario = (idx) => {
    if (scPicked !== null) return
    setScPicked(idx); setScShowFb(true)
    setScScore(s => s + SCENARIOS[si].options[idx].pts)
  }

  const nextScenario = () => {
    setScPicked(null); setScShowFb(false)
    if (si + 1 >= SCENARIOS.length) endGame('scenario')
    else setSi(s => s + 1)
  }

  const endGame = async (mode) => {
    const fs = mode === 'quiz' ? score : scScore
    await saveScore({ name: player.name, avatar: player.av, score: fs, mode: mode === 'quiz' ? 'Quiz' : 'Tình huống' })
    setScreen('result')
  }

  const startMode = (mode) => { setPending(mode); setScreen('setup') }

  const confirmPlayer = () => {
    if (!nameVal.trim()) { showToast('Hãy nhập tên của bạn'); return }
    setPlayer({ name: nameVal.trim(), av: pickedAv })
    if (pendingMode === 'quiz') {
      setScore(0); setQi(0); setCombo(0); setMaxCombo(0); setCorrectCount(0); setFastest(99); setChosen(null); setShowFb(false)
      setScreen('quiz')
    } else {
      setScScore(0); setSi(0); setScPicked(null); setScShowFb(false)
      setScreen('scenario')
    }
  }

  const retry = () => {
    if (pendingMode === 'quiz') {
      setScore(0); setQi(0); setCombo(0); setMaxCombo(0); setCorrectCount(0); setFastest(99); setChosen(null); setShowFb(false)
      setScreen('quiz')
    } else {
      setScScore(0); setSi(0); setScPicked(null); setScShowFb(false)
      setScreen('scenario')
    }
  }

  const maxPossible = pendingMode === 'quiz' ? QUIZ.length * 150 : 300
  const finalScore = pendingMode === 'quiz' ? score : scScore
  const pct = finalScore / maxPossible
  const rank = pct >= 0.85 ? { label: 'Chuyên gia Văn hóa Toàn cầu', icon: '🏆', col: C.gold }
    : pct >= 0.65 ? { label: 'Nhà Kinh doanh Quốc tế', icon: '🥈', col: '#c0c0c0' }
    : pct >= 0.45 ? { label: 'Học viên Tiến bộ', icon: '🥉', col: '#cd7f32' }
    : { label: 'Cần Ôn Tập Thêm', icon: '📖', col: C.teal }

  const timerCol = timeLeft > 10 ? C.teal : timeLeft > 5 ? C.gold : C.rose
  const deg = (timeLeft / 20) * 360

  const s = (obj) => Object.assign({}, obj)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} button{cursor:pointer} input{-webkit-appearance:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes popIn{0%{transform:scale(0) translate(-50%,-50%);opacity:0}50%{transform:scale(1.2) translate(-50%,-50%);opacity:1}100%{transform:scale(.9) translate(-50%,-60%);opacity:0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {toast && <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: C.panel, border: `1px solid ${C.teal}`, color: C.text, padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap', animation: 'fadeIn .3s' }}>{toast}</div>}
      {comboFlash && <div style={{ position: 'fixed', top: '50%', left: '50%', fontFamily: "'Syne',sans-serif", fontSize: 52, color: C.gold, textShadow: `0 0 30px ${C.gold}`, pointerEvents: 'none', zIndex: 998, animation: 'popIn .8s forwards' }}>{combo}× COMBO!</div>}

      {/* ══ HOME ══ */}
      {screen === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 60px', background: `radial-gradient(ellipse 70% 40% at 50% 0%,rgba(45,212,191,.07) 0%,transparent 65%)` }}>
          <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
            <span style={{ fontSize: 64, display: 'block', animation: 'bob 4s ease-in-out infinite', marginBottom: 20 }}>🌍</span>
            <div style={{ display: 'inline-block', background: 'rgba(45,212,191,.08)', border: '1px solid rgba(45,212,191,.25)', color: C.teal, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 50, letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' }}>Văn hóa & Đạo đức Kinh doanh · Bài 2</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(36px,9vw,58px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1, background: `linear-gradient(135deg,${C.teal},${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>VĂN HÓA<br />KINH DOANH</h1>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 36 }}>Kiểm tra kiến thức về Văn hóa Kinh doanh Quốc tế<br />và Văn hóa Số — từ tài liệu học chính thức</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { mode: 'quiz', icon: '🧠', name: 'Quiz Nhanh', desc: `${QUIZ.length} câu · 20 giây/câu · Điểm thưởng tốc độ` },
                { mode: 'scenario', icon: '🎭', name: 'Tình Huống Coca-Cola', desc: `${SCENARIOS.length} kịch bản · Đóng vai ông John tại Ấn Độ` },
              ].map(m => (
                <button key={m.mode} onClick={() => startMode(m.mode)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', color: C.text, width: '100%', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(45,212,191,.4)'; e.currentTarget.style.background = '#1a2a3d' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card }}>
                  <span style={{ fontSize: 34 }}>{m.icon}</span>
                  <div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{m.name}</div><div style={{ fontSize: 12, color: C.muted }}>{m.desc}</div></div>
                </button>
              ))}
            </div>
            <button onClick={() => setScreen('lb')} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,.14)', color: C.muted, padding: '12px 0', borderRadius: 50, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.14)'; e.currentTarget.style.color = C.muted }}>
              🏆 Bảng Xếp Hạng
            </button>
          </div>
        </div>
      )}

      {/* ══ SETUP ══ */}
      {screen === 'setup' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Nhập thông tin</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Tên của bạn sẽ xuất hiện trên bảng xếp hạng chung</p>
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 7 }}>Tên</div>
            <input value={nameVal} onChange={e => setNameVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmPlayer()} placeholder="Nhập tên..." maxLength={20}
              style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600, padding: '13px 16px', borderRadius: 12, outline: 'none', marginBottom: 20 }} />
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Avatar</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {AVS.map(av => (
                <button key={av} onClick={() => setPickedAv(av)} style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${pickedAv === av ? C.gold : 'rgba(255,255,255,.1)'}`, background: pickedAv === av ? 'rgba(244,197,66,.12)' : 'rgba(255,255,255,.05)', fontSize: 22, transform: pickedAv === av ? 'scale(1.1)' : 'scale(1)', transition: 'all .2s' }}>{av}</button>
              ))}
            </div>
            <button onClick={confirmPlayer} style={{ width: '100%', background: C.teal, border: 'none', color: C.bg, fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 12, transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5eead4'} onMouseLeave={e => e.currentTarget.style.background = C.teal}>
              Bắt đầu →
            </button>
            <button onClick={() => setScreen('home')} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: C.muted, fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginTop: 12, padding: '8px 0', cursor: 'pointer' }}>← Quay lại</button>
          </div>
        </div>
      )}

      {/* ══ QUIZ ══ */}
      {screen === 'quiz' && (() => {
        const q = QUIZ[qi]
        return (
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.panel, padding: '7px 14px', borderRadius: 50, fontSize: 13, fontWeight: 600 }}><span>{player.av}</span><span>{player.name}</span></div>
              <div style={{ background: C.gold, color: C.bg, padding: '7px 18px', borderRadius: 50, fontSize: 14, fontWeight: 700 }}>⭐ {score}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 6, height: 5, marginBottom: 10, overflow: 'hidden' }}><div style={{ height: '100%', background: C.teal, borderRadius: 6, width: `${(qi / QUIZ.length) * 100}%`, transition: 'width .4s' }} /></div>
            <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Câu {qi + 1} / {QUIZ.length}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(${timerCol} ${deg}deg,rgba(255,255,255,.08) ${deg}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>{timeLeft}</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px 20px', marginBottom: 14 }}>
              <span style={{ display: 'inline-block', background: 'rgba(45,212,191,.1)', color: C.teal, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '3px 10px', borderRadius: 50, marginBottom: 12 }}>{q.cat}</span>
              <div style={{ fontSize: 'clamp(14px,3.5vw,17px)', fontWeight: 600, lineHeight: 1.6 }}>{q.q}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {q.opts.map((opt, i) => {
                const isC = i === q.correct, isP = i === chosen, rev = chosen !== null
                let bg = 'rgba(255,255,255,.04)', bc = 'rgba(255,255,255,.1)', col = C.text
                if (rev && isC) { bg = 'rgba(110,231,183,.12)'; bc = C.sage; col = C.sage }
                else if (rev && isP) { bg = 'rgba(242,95,122,.1)'; bc = C.rose; col = C.rose }
                return (
                  <button key={i} disabled={chosen !== null} onClick={() => pickAnswer(i)}
                    style={{ background: bg, border: `1.5px solid ${bc}`, color: col, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, padding: '13px 16px', borderRadius: 12, textAlign: 'left', lineHeight: 1.5, transition: 'all .18s' }}
                    onMouseEnter={e => { if (chosen === null) { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = 'rgba(45,212,191,.08)' } }}
                    onMouseLeave={e => { if (chosen === null) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' } }}>
                    <span style={{ opacity: .5, marginRight: 8 }}>{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                  </button>
                )
              })}
            </div>
            {showFb && (
              <div style={{ background: chosen === q.correct ? 'rgba(110,231,183,.1)' : 'rgba(242,95,122,.1)', border: `1px solid ${chosen === q.correct ? 'rgba(110,231,183,.3)' : 'rgba(242,95,122,.3)'}`, borderRadius: 14, padding: '16px 18px', marginBottom: 14, animation: 'slideUp .35s' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, color: chosen === q.correct ? C.sage : C.rose }}>
                  {chosen === -1 ? '⏰ Hết giờ!' : chosen === q.correct ? `✅ Chính xác!${combo >= 2 ? ` · ${combo}× Combo` : ''}` : '❌ Chưa đúng'}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(220,232,245,.8)' }}>💡 {q.explain}</div>
              </div>
            )}
            {showFb && (
              <button onClick={nextQ} style={{ width: '100%', background: C.teal, border: 'none', color: C.bg, fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 12, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#5eead4'} onMouseLeave={e => e.currentTarget.style.background = C.teal}>
                {qi + 1 < QUIZ.length ? 'Câu tiếp theo →' : 'Xem kết quả 🏆'}
              </button>
            )}
          </div>
        )
      })()}

      {/* ══ SCENARIO ══ */}
      {screen === 'scenario' && (() => {
        const sc = SCENARIOS[si]
        return (
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>🎭 Tình huống Coca-Cola</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Bạn là ông John — Trưởng đoàn đàm phán</div></div>
              <div style={{ background: C.gold, color: C.bg, padding: '7px 18px', borderRadius: 50, fontSize: 14, fontWeight: 700 }}>⭐ {scScore}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 6, height: 5, marginBottom: 20, overflow: 'hidden' }}><div style={{ height: '100%', background: C.gold, borderRadius: 6, width: `${(si / SCENARIOS.length) * 100}%`, transition: 'width .4s' }} /></div>
            <div style={{ background: C.card, border: '1px solid rgba(244,197,66,.15)', borderRadius: 18, padding: '22px 20px', marginBottom: 14 }}>
              <div style={{ display: 'inline-block', background: 'rgba(244,197,66,.1)', color: C.gold, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '3px 10px', borderRadius: 50, marginBottom: 14 }}>Tình huống {si + 1}/{SCENARIOS.length} · {sc.title}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: C.panel, border: `2px solid ${C.teal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧑‍💼</div>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: C.gold }}>Ông John</div><div style={{ fontSize: 11, color: C.muted }}>Trưởng đoàn Coca-Cola · Mỹ</div></div>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(220,232,245,.85)', marginBottom: 14 }}>{sc.context}</div>
              <div style={{ background: 'rgba(45,212,191,.06)', borderLeft: `3px solid ${C.teal}`, borderRadius: 6, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: C.teal }}>{sc.question}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {sc.options.map((opt, i) => {
                const picked = scPicked === i
                const tc = { best: C.sage, okay: C.gold, bad: C.rose }[opt.type]
                const rb = { best: 'rgba(110,231,183', okay: 'rgba(244,197,66', bad: 'rgba(242,95,122' }[opt.type]
                return (
                  <button key={i} disabled={scPicked !== null} onClick={() => pickScenario(i)}
                    style={{ background: picked ? `${rb},.1)` : 'rgba(255,255,255,.04)', border: `1.5px solid ${picked ? tc : 'rgba(255,255,255,.1)'}`, color: picked ? tc : C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, padding: '14px 16px', borderRadius: 12, textAlign: 'left', lineHeight: 1.5, transition: 'all .2s' }}
                    onMouseEnter={e => { if (scPicked === null) { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = 'rgba(45,212,191,.07)'; e.currentTarget.style.paddingLeft = '20px' } }}
                    onMouseLeave={e => { if (scPicked === null) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.paddingLeft = '16px' } }}>
                    {opt.text}
                  </button>
                )
              })}
            </div>
            {scShowFb && (() => {
              const ch = sc.options[scPicked]
              const tc = { best: C.sage, okay: C.gold, bad: C.rose }[ch.type]
              const label = { best: '✅ Lựa chọn tốt nhất', okay: '👍 Chấp nhận được', bad: '❌ Sai lầm văn hóa' }[ch.type]
              const rb = { best: 'rgba(110,231,183', okay: 'rgba(244,197,66', bad: 'rgba(242,95,122' }[ch.type]
              return (
                <div style={{ background: `${rb},.08)`, border: `1px solid ${tc}33`, borderRadius: 14, padding: '18px 20px', marginBottom: 14, animation: 'slideUp .35s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 700, fontSize: 14, color: tc }}>{label}</span><span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, color: tc }}>+{ch.pts}</span></div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(220,232,245,.8)', marginBottom: 8 }}>{ch.explain}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Điểm tích lũy: <strong style={{ color: tc }}>{scScore}</strong></div>
                </div>
              )
            })()}
            {scShowFb && (
              <button onClick={nextScenario} style={{ width: '100%', background: C.teal, border: 'none', color: C.bg, fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 12, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#5eead4'} onMouseLeave={e => e.currentTarget.style.background = C.teal}>
                {si + 1 < SCENARIOS.length ? 'Tình huống tiếp theo →' : 'Xem kết quả 🏆'}
              </button>
            )}
          </div>
        )
      })()}

      {/* ══ RESULT ══ */}
      {screen === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 60px', textAlign: 'center' }}>
          <div style={{ width: '100%', maxWidth: 460 }}>
            <div style={{ fontSize: 64, animation: 'bob 3s ease-in-out infinite', marginBottom: 16 }}>{rank.icon}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Điểm số của bạn</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 72, fontWeight: 800, lineHeight: 1, background: `linear-gradient(135deg,${C.gold},#ff9a00)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{finalScore}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>/ {maxPossible} điểm</div>
            <div style={{ display: 'inline-block', background: `${rank.col}18`, border: `1px solid ${rank.col}55`, color: rank.col, padding: '8px 22px', borderRadius: 50, fontSize: 15, fontWeight: 700, marginBottom: 28 }}>{rank.label}</div>
            {pendingMode === 'quiz' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
                {[{ v: `${correctCount}/${QUIZ.length}`, l: 'Đúng' }, { v: `×${maxCombo}`, l: 'Combo max' }, { v: fastest === 99 ? '—' : `${fastest}s`, l: 'Nhanh nhất' }].map(s => (
                  <div key={s.l} style={{ background: C.card, borderRadius: 14, padding: '14px 10px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: C.teal }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: C.card, border: '1px solid rgba(244,197,66,.2)', borderRadius: 16, padding: '18px 20px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📌 Bài học từ tài liệu</div>
              {['Văn hóa kinh doanh quốc tế là sự giao thoa giữa các nền văn hóa khác nhau', 'Rủi ro văn hóa tăng khi áp dụng định hướng vị chủng', 'Giải pháp: định hướng đa tâm và định hướng toàn cầu', 'Văn hóa là rào cản số một của chuyển đổi số', 'Công nghệ là động lực chính đằng sau văn hóa kinh doanh số'].map((l, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(220,232,245,.75)', padding: '5px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}><span style={{ color: C.gold, marginRight: 6 }}>✦</span>{l}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: '🔄 Chơi lại', fn: retry, bg: C.teal, col: C.bg },
                { label: '🏆 Bảng xếp hạng', fn: () => setScreen('lb'), bg: 'transparent', col: C.text, border: '1px solid rgba(255,255,255,.15)' },
                { label: '🏠 Trang chủ', fn: () => setScreen('home'), bg: 'transparent', col: C.text, border: '1px solid rgba(255,255,255,.15)' },
              ].map(b => (
                <button key={b.label} onClick={b.fn} style={{ background: b.bg, border: b.border || 'none', color: b.col, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s' }}>{b.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ LEADERBOARD ══ */}
      {screen === 'lb' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 60px' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: C.muted, fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 20, padding: 0, cursor: 'pointer' }}>← Quay lại</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: C.gold }}>🏆 Bảng Xếp Hạng</h2>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Điểm cao nhất từ tất cả người chơi</p>
              </div>
              <button onClick={loadLb} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>↻ Tải lại</button>
            </div>
            {lbLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 32, height: 32, border: `3px solid rgba(255,255,255,.1)`, borderTopColor: C.teal, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 13, color: C.muted }}>Đang tải...</div>
              </div>
            ) : lb.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.muted, padding: '40px 0', fontSize: 14 }}>
                Chưa có điểm nào. Hãy là người đầu tiên! 🎮<br />
                <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>(Cần kết nối Supabase để lưu điểm chung)</span>
              </div>
            ) : (
              lb.map((e, i) => {
                const rc = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : C.muted
                const rs = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`
                return (
                  <div key={e.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.card, border: `1px solid ${i < 3 ? rc + '30' : C.border}`, borderRadius: 14, padding: '13px 18px', marginBottom: 8, animation: `slideUp ${0.1 + i * 0.06}s` }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: i < 3 ? 22 : 16, color: rc, width: 30, textAlign: 'center', flexShrink: 0 }}>{rs}</div>
                    <div style={{ fontSize: 26, flexShrink: 0 }}>{e.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{e.mode}</div>
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, color: C.gold }}>{e.score}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
