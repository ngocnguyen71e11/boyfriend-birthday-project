let currentState = "idle";
document.fonts.load('600 100px "Cormorant Garamond"');
document.fonts.load('600 110px "Dancing Script"');
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
let heartFrames = 0;

const clickHint = document.getElementById("clickHint");
let particles = [];
let rotationX = 0;
let rotationY = 0;
let heartZoom = 1.5;
let targetZoom = 1.5;
let explosionFrames = 0;
let birthdayFrames = 0;
let loveBlinkFrames = 0;
let isLoveBlinking = true;

let nextText = "";

let centerClickRadius = 65;
const minZoom = 0.5;
const maxZoom = 2.5;
let autoRotateSpeed = 0.003;
let gatherFrames = 0;
let isDragging = false;

let previousMouseX = 0;
let previousMouseY = 0;
let canvasWidth;
let canvasHeight;
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);
class Particle {
    constructor() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.z = 0;

        this.targetX = 0;
        this.targetY = 0;
        this.targetZ = 0;

        this.radius = Math.random() * 1.8 + 1;
        this.opacity = Math.random() * 0.6 + 0.4;

        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;

        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
    }

    moveToTarget() {
        this.x += (this.targetX - this.x) * 0.045;
        this.y += (this.targetY - this.y) * 0.045;
        this.z += (this.targetZ - this.z) * 0.045;
    }

    draw(projected) {
        ctx.beginPath();

        ctx.arc(
            projected.x,
            projected.y,
            this.radius * projected.scale,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = `rgba(150, 220, 255, ${this.opacity})`;

        ctx.shadowBlur = 12 * projected.scale;
        ctx.shadowColor = "#69cfff";

        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

function getHeartPosition() {

    let t = Math.random() * Math.PI * 2;

    // Công thức đường viền trái tim
    let heartX = 16 * Math.pow(Math.sin(t), 3);

    let heartY = 13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    // Phân bố hạt vào bên trong trái tim
    let fill = Math.sqrt(Math.random());

    // Tạo chiều sâu 3D
    let depth = (Math.random() - 0.5) * 12;

    let scale = 10;

    return {
        x: heartX * fill * scale,
        y: -heartY * fill * scale,
        z: depth * scale
    };
}
function project3D(x, y, z) {

    // Xoay quanh trục Y
    let rotatedX =
        x * Math.cos(rotationY) -
        z * Math.sin(rotationY);

    let rotatedZ =
        x * Math.sin(rotationY) +
        z * Math.cos(rotationY);

    // Xoay quanh trục X
    let finalY =
        y * Math.cos(rotationX) -
        rotatedZ * Math.sin(rotationX);

    let finalZ =
        y * Math.sin(rotationX) +
        rotatedZ * Math.cos(rotationX);

    // Phối cảnh 3D
    let perspective = 700 / (700 + finalZ);

    return {
        x: canvasWidth / 2 + rotatedX * perspective * heartZoom,
        y: canvasHeight / 2 + finalY * perspective * heartZoom,
        z: finalZ,
        scale: perspective * heartZoom
    };
}
function formHeart() {

    particles.forEach(particle => {

        // Chuyển tọa độ màn hình thành tọa độ quanh tâm
        particle.x -= canvasWidth / 2;
        particle.y -= canvasHeight / 2;

        let position = getHeartPosition();

        particle.targetX = position.x;
        particle.targetY = position.y;
        particle.targetZ = position.z;

    });

}
function startExplosion(message) {

    currentState = "exploding";

    explosionFrames = 0;
    nextText = message;

    particles.forEach(particle => {

        let angle = Math.random() * Math.PI * 2;

        let speed = Math.random() * 7 + 3;

        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;

        particle.vz = (Math.random() - 0.5) * 8;

    });

}
function getTextPositions(message) {

    const textCanvas = document.createElement("canvas");

    textCanvas.width = canvasWidth;
    textCanvas.height = canvasHeight;

    const textCtx = textCanvas.getContext("2d");

    // Chọn font theo nội dung
    let fontFamily = message === "Anh iu ♥"
        ? "Dancing Script"
        : "Cormorant Garamond";

    let fontSize = message === "Anh iu ♥" ? 110 : 100;

    textCtx.font = `600 ${fontSize}px "${fontFamily}"`;

    // Tự động điều chỉnh kích thước để chữ không tràn màn hình
    let textWidth = textCtx.measureText(message).width;

    if (textWidth > canvasWidth * 0.85) {
        fontSize *= (canvasWidth * 0.85) / textWidth;
        textCtx.font = `600 ${fontSize}px "${fontFamily}"`;
    }

    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "white";

    textCtx.fillText(
        message,
        canvasWidth / 2,
        canvasHeight / 2
    );

    const imageData = textCtx.getImageData(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    let positions = [];

    for (let y = 0; y < canvasHeight; y += 3) {

        for (let x = 0; x < canvasWidth; x += 3) {

            let index = (y * canvasWidth + x) * 4;

            if (imageData.data[index + 3] > 128) {

                positions.push({ x, y });

            }

        }

    }

    return positions;
}
function formText(message) {

    let positions = getTextPositions(message);

    rotationX = 0;
    rotationY = 0;

    heartZoom = 1.5;
    targetZoom = 1.5;

    particles.forEach((particle, index) => {

        let point = positions[
            Math.floor(index * positions.length / particles.length)
        ];

        particle.targetX = point.x - canvasWidth / 2;
        particle.targetY = point.y - canvasHeight / 2;

        particle.targetZ = (Math.random() - 0.5) * 5;

    });

}
for (let i = 0; i < 1000; i++) {
    particles.push(new Particle());
}
function draw3DParticles() {

    let projectedParticles = particles.map(particle => {

        return {
            particle: particle,

            projected: project3D(
                particle.x,
                particle.y,
                particle.z
            )

        };

    });

    projectedParticles.sort((a, b) => {
        return b.projected.z - a.projected.z;
    });

    projectedParticles.forEach(item => {

        item.particle.draw(item.projected);

    });

}
function animate() {

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    heartZoom += (targetZoom - heartZoom) * 0.1;

    // 1. Các hạt bay tự do
    if (currentState === "idle") {

        particles.forEach(particle => {

            particle.update();

            particle.draw({
                x: particle.x,
                y: particle.y,
                scale: 1
            });

        });

    }

    // 2. Hội tụ thành trái tim
    else if (currentState === "gathering") {

        gatherFrames++;

        particles.forEach(particle => {
            particle.moveToTarget();
        });

        draw3DParticles();

        if (gatherFrames >= 180) {

            currentState = "heart";

            canvas.style.cursor = "grab";

        }

    }

    // 3. Trái tim 3D
    else if (currentState === "heart") {

        heartFrames++;

        if (heartFrames >= 300) {
            clickHint.classList.add("show");
        }

        if (!isDragging) {
            rotationY += autoRotateSpeed;
        }

        draw3DParticles();

    }

    // 4. Các hạt phát tán
    else if (currentState === "exploding") {

        explosionFrames++;

        particles.forEach(particle => {

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;

            particle.vx *= 0.97;
            particle.vy *= 0.97;
            particle.vz *= 0.97;

        });

        draw3DParticles();

        if (explosionFrames >= 45) {

            formText(nextText);

            gatherFrames = 0;

            currentState = nextText === "Chúc mừng sinh nhật"
                ? "birthdayGathering"
                : "loveGathering";

        }

    }

    // 5. Hội tụ thành chữ
    else if (
        currentState === "birthdayGathering" ||
        currentState === "loveGathering"
    ) {

        gatherFrames++;

        particles.forEach(particle => {
            particle.moveToTarget();
        });

        draw3DParticles();

        if (gatherFrames >= 150) {

            currentState = currentState === "birthdayGathering"
                ? "birthday"
                : "love";

            birthdayFrames = 0;
            loveBlinkFrames = 0;

        }

    }

    // 6. Giữ chữ Happy Birthday trong 5 giây
    else if (currentState === "birthday") {

        draw3DParticles();

        birthdayFrames++;

        if (birthdayFrames >= 80) {

            startExplosion("Anh iu ♥");

        }

    }

    // 7. Hiển thị lời chúc cuối
    else if (currentState === "love") {

        loveBlinkFrames++;

        if (loveBlinkFrames <= 180) {

            let blink = Math.floor(loveBlinkFrames / 15) % 2;

            particles.forEach(particle => {
                particle.opacity = blink === 0 ? 0.15 : 1;
            });

        } else {

            particles.forEach(particle => {
                particle.opacity = 1;
            });

            if (loveBlinkFrames === 181) {

                window.showSolarSystem();

            }

        }

        draw3DParticles();

    }

    requestAnimationFrame(animate);

}


animate();
canvas.addEventListener("wheel", function (event) {

    if (currentState !== "heart") return;

    event.preventDefault();

    if (event.deltaY < 0) {
        targetZoom += 0.1;
    } else {
        targetZoom -= 0.1;
    }

    targetZoom = Math.max(
        minZoom,
        Math.min(maxZoom, targetZoom)
    );

}, { passive: false });
startButton.addEventListener("click", function () {

    currentState = "gathering";
    gatherFrames = 0;
    startButton.style.display = "none";

    formHeart();

});


clickHint.addEventListener("click", function () {

    // Nếu đang ở màn hình trái tim
    if (currentState === "heart") {

        clickHint.classList.remove("show");

        startExplosion("Chúc mừng sinh nhật");

        return;
    }

    // Nếu đang ở màn hình Hệ Mặt Trời
    if (document.body.classList.contains("solar-mode")) {

        if (typeof window.showWelcomeScreen === "function") {
            window.showWelcomeScreen();
        }

    }

});


let dragStartX = 0;
let dragStartY = 0;
let hasDragged = false;

canvas.addEventListener("pointerdown", function (event) {

    if (currentState !== "heart") return;
    if (event.button !== 0) return;

    isDragging = true;
    hasDragged = false;

    dragStartX = event.clientX;
    dragStartY = event.clientY;

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

});

window.addEventListener("pointermove", function (event) {

    if (!isDragging) return;

    let deltaX = event.clientX - previousMouseX;
    let deltaY = event.clientY - previousMouseY;

    if (
        Math.abs(event.clientX - dragStartX) > 4 ||
        Math.abs(event.clientY - dragStartY) > 4
    ) {
        hasDragged = true;
    }

    if (hasDragged) {

        rotationY += deltaX * 0.01;
        rotationX += deltaY * 0.01;

    }

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

});

window.addEventListener("pointerup", function (event) {

    if (!isDragging) return;

    if (!hasDragged && currentState === "heart") {

        let distance = Math.hypot(
            event.clientX - canvasWidth / 2,
            event.clientY - canvasHeight / 2
        );

        if (distance < centerClickRadius) {

            clickHint.classList.remove("show");

            startExplosion("Chúc mừng sinh nhật");

        }

    }

    isDragging = false;

});

window.addEventListener("pointercancel", function () {
    isDragging = false;
});
canvas.addEventListener("pointerdown", function (event) {

    if (currentState !== "heart") return;

    isDragging = true;

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

    canvas.style.cursor = "grabbing";

});

window.addEventListener("pointermove", function (event) {

    if (!isDragging) return;

    let deltaX = event.clientX - previousMouseX;
    let deltaY = event.clientY - previousMouseY;

    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

});

window.addEventListener("pointerup", function () {

    isDragging = false;

    canvas.style.cursor = "grab";

});

const declineButton = document.getElementById("declineButton");

let declineScale = 1;
let declineHasMoved = false;

declineButton.addEventListener("click", function () {

    // Lấy vị trí hiện tại của nút
    const rect = declineButton.getBoundingClientRect();

    // Lần click đầu tiên: chuyển nút sang chế độ định vị cố định
    if (!declineHasMoved) {

        declineButton.style.position = "fixed";
        declineButton.style.left = rect.left + "px";
        declineButton.style.top = rect.top + "px";

        declineHasMoved = true;
    }

    // Giảm kích thước sau mỗi lần click
    declineScale *= 0.85;

    declineButton.style.transform = `scale(${declineScale})`;

    // Tính toán vị trí ngẫu nhiên
    const maxX = window.innerWidth - declineButton.offsetWidth;
    const maxY = window.innerHeight - declineButton.offsetHeight;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    // Di chuyển nút
    declineButton.style.left = randomX + "px";
    declineButton.style.top = randomY + "px";

});

const questions = [
    {
        question: "Ngày sinh của em là:",
        answers: [
            "20/08/2001",
            "20/07/2001",
            "21/07/2001",
            "21/08/2001"
        ],
        correctAnswer: 1
    },

    {
        question: "Cung hoàng đạo của em là:",
        answers: [
            "Sư Tử",
            "Sử Nữ",
            "Cự Giải",
            "Ma Kết"
        ],
        correctAnswer: 2
    },

    {
        question: "Loài hoa em ghét nhất là:",
        answers: [
            "Tulip",
            "Cẩm tú cầu",
            "Cẩm chướng",
            "Không loài nào"
        ],
        correctAnswer: 3
    },

    {
        question: "em thích thể loại nhạc nào?",
        answers: [
            "K-pop",
            "V-pop",
            "US-UK",
            "Tất cả đều thích"
        ],
        correctAnswer: 3
    },

    {
        question: "Em thích uống loại nước nào nhất:",
        answers: [
            "Trà hoa quả",
            "Nước ép hoa quả",
            "Matcha latte",
            "O-long đào sữa"
        ],
        correctAnswer: 0
    },
    {
        question: "Em thích đi đâu:",
        answers: [
            "Đi ăn",
            "Đi du lịch",
            "Đi dạo",
            "Đi uống nước"
        ],
        correctAnswer: 1
    },

    {
        question: "em thích loại son nào nhất?",
        answers: [
            "Son dưỡng",
            "Son lì",
            "Son tint",
            "Son kem"
        ],
        correctAnswer: 2
    },

    {
        question: "Tính xấu của em là gì?",
        answers: [
            "Thù dai - nhớ lâu",
            "Thiếu kiên nhẫn",
            "Silent treatment ",
            "Em không có tính xấu nào cả"
        ],
        correctAnswer: 3
    },

    {
        question: "Mình yêu nhau ngày nào?",
        answers: [
            "04/05/2026",
            "08/07/2026",
            "06/08/2026",
            "Ai mà nhớ"
        ],
        correctAnswer: 3
    },

    {
        question: "Em mà biến thành con gián anh có yêu em không?",
        answers: [
            "Có",
            "có",
            "Có",
            "Có"
        ],
        correctAnswer: 3
    }
];

// Trạng thái của trò chơi
let currentQuestionIndex = 0;
let correctAnswers = 0;
// Trạng thái chế độ bí mật
let isSecretMode = false;
// Lưu đáp án người chơi đã chọn ở từng câu
let selectedAnswers = Array(10).fill(null);
// Lấy các phần tử HTML
const quizScreen = document.getElementById("quizScreen");
const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const answerContainer = document.getElementById("answerContainer");
// Các màn hình kết quả
const winScreen = document.getElementById("winScreen");
const loseScreen = document.getElementById("loseScreen");
// Màn hình bí mật
const secretScreen = document.getElementById("secretScreen");

// Hiển thị điểm số
const winScore = document.getElementById("winScore");
const loseScore = document.getElementById("loseScore");
function showQuestion() {

    // Lấy câu hỏi hiện tại
    const currentQuestion = questions[currentQuestionIndex];

    // Hiển thị số thứ tự câu hỏi
    questionNumber.textContent =
        `${String(currentQuestionIndex + 1).padStart(2, "0")} / 10`;

    // Hiển thị nội dung câu hỏi
    questionText.textContent = currentQuestion.question;

    // Xóa các đáp án cũ
    answerContainer.innerHTML = "";

    // Tạo 4 nút đáp án
    currentQuestion.answers.forEach((answer, index) => {

        const button = document.createElement("button");

        button.classList.add("answer-button");

        button.textContent =
            `${String.fromCharCode(65 + index)}. ${answer}`;


        button.addEventListener("click", function () {
            // Lưu đáp án người chơi đã chọn
            selectedAnswers[currentQuestionIndex] = index;
            // Ngăn chọn nhiều đáp án
            const allButtons = answerContainer.querySelectorAll("button");

            allButtons.forEach(btn => {
                btn.disabled = true;
            });

            // Đánh dấu đáp án được chọn
            button.classList.add("selected");

            // Kiểm tra đáp án
            if (index === currentQuestion.correctAnswer) {

                button.classList.add("correct");

                // Cộng 1 điểm nếu trả lời đúng
                correctAnswers++;

            } else {

                button.classList.add("wrong");

                // Hiển thị đáp án đúng
                allButtons[currentQuestion.correctAnswer]
                    .classList.add("correct");

            }
            // Chờ 1,5 giây rồi chuyển câu
            setTimeout(() => {

                currentQuestionIndex++;

                if (currentQuestionIndex < questions.length) {

                    showQuestion();

                } else {

                    showResult();

                }

            }, 1500);

        });

        answerContainer.appendChild(button);

    });

}
function checkSecretMode() {

    return (
        selectedAnswers[2] === 1 &&
        selectedAnswers[7] === 0 &&
        selectedAnswers[8] === 1
    );

}
function showResult() {

    // Ẩn màn hình câu hỏi
    quizScreen.classList.remove("show");
console.log("Các đáp án đã chọn:", selectedAnswers);
console.log("Có kích hoạt bí mật:", checkSecretMode());
    // Kiểm tra chế độ bí mật trước tiên
    if (checkSecretMode()) {

        isSecretMode = true;

        secretScreen.classList.add("show");

        // Sau 3 giây chuyển sang phong thư
        setTimeout(() => {

            secretScreen.classList.remove("show");

            setTimeout(() => {

                letterScreen.classList.add("show");

            }, 1000);

        }, 3000);

        return;
    }

    // Nếu không có chế độ bí mật, xét điểm thông thường
    if (correctAnswers >= 5) {

        isSecretMode = false;

        winScore.textContent =
            `Anh trả lời đúng ${correctAnswers}/10 câu!`;

        winScreen.classList.add("show");

        setTimeout(() => {

            winScreen.classList.remove("show");

            setTimeout(() => {

                letterScreen.classList.add("show");

            }, 1000);

        }, 3000);

    } else {

        loseScore.textContent =
            `Anh chỉ trả lời đúng ${correctAnswers}/10 câu!`;

        loseScreen.classList.add("show");

    }

}
const joinButton = document.getElementById("joinButton");

joinButton.addEventListener("click", function () {

    // Ẩn màn hình chào mừng
    const welcomeScreen = document.getElementById("welcomeScreen");

    welcomeScreen.classList.remove("show");

    // Hiển thị màn hình Quiz
    quizScreen.classList.add("show");

    // Đưa về câu hỏi đầu tiên
    currentQuestionIndex = 0;
correctAnswers = 0;
selectedAnswers = Array(10).fill(null);
isSecretMode = false;

    // Hiển thị câu hỏi
    showQuestion();

});
const retryButton = document.getElementById("retryButton");

retryButton.addEventListener("click", function () {

    // Ẩn màn hình thua
    loseScreen.classList.remove("show");

    // Đặt lại điểm số
    correctAnswers = 0;
    selectedAnswers = Array(10).fill(null);
    isSecretMode = false;

    // Quay về câu hỏi đầu tiên
    currentQuestionIndex = 0;

    // Hiển thị màn hình Quiz
    quizScreen.classList.add("show");

    // Hiển thị câu hỏi số 1
    showQuestion();

});
const letterScreen = document.getElementById("letterScreen");

const openLetterButton = document.getElementById("openLetterButton");

openLetterButton.addEventListener("click", function () {

    const letterContainer = document.querySelector(".letter-container");
    // Lựa chọn nội dung thư theo kết quả trò chơi
    const normalContent = document.getElementById("normalLetterContent");
    const secretContent = document.getElementById("secretLetterContent");

    if (isSecretMode) {

        secretContent.classList.add("active");
        normalContent.classList.remove("active");

    } else {

        normalContent.classList.add("active");
        secretContent.classList.remove("active");

    }

    // Lật nắp thư
    openLetterButton.classList.add("open");

    // Đợi nắp thư mở rồi đưa giấy ra
    setTimeout(() => {

        letterContainer.classList.add("open");

    }, 800);

});