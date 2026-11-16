
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// =================================
// 1. KHỞI TẠO KHÔNG GIAN 3D
// =================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x02030a);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 20, 50);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});


renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.enablePan = false;

controls.minDistance = 15;
controls.maxDistance = 100;

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

document
    .getElementById("solarSystemContainer")
    .appendChild(renderer.domElement);


// =================================
// 2. TẠO NỀN SAO
// =================================
function createStarTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        32, 32, 0,
        32, 32, 32
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.3)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

function createStars() {

    const starGeometry = new THREE.BufferGeometry();

    const starCount = 3500;

    const positions = [];
    const colors = [];

    for (let i = 0; i < starCount; i++) {

        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;

        positions.push(x, y, z);

        const color = new THREE.Color();

        color.setHSL(
            0.55 + Math.random() * 0.15,
            0.5 + Math.random() * 0.5,
            0.6 + Math.random() * 0.4
        );

        colors.push(color.r, color.g, color.b);

    }

    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    starGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        map: createStarTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        alphaTest: 0.01,
        depthWrite: false,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(
        starGeometry,
        starMaterial
    );

    scene.add(stars);

    return stars;

}

const stars = createStars();


// =================================
// 3. TẠO MẶT TRỜI
// =================================

const sunGeometry = new THREE.SphereGeometry(
    5,
    64,
    64
);

const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa500
});

const sun = new THREE.Mesh(
    sunGeometry,
    sunMaterial
);

scene.add(sun);


// =================================
// 4. TẠO QUẦNG SÁNG
// =================================

const glowGeometry = new THREE.SphereGeometry(
    6.5,
    64,
    64
);

const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const sunGlow = new THREE.Mesh(
    glowGeometry,
    glowMaterial
);

scene.add(sunGlow);


// =================================
// 5. ÁNH SÁNG MẶT TRỜI
// =================================

const sunLight = new THREE.PointLight(
    0xffaa33,
    300,
    200
);

scene.add(sunLight);

// =================================
// TEXTURE LOADER
// =================================

// =================================
// PROCEDURAL PLANET TEXTURES
// =================================

function createPlanetTexture(type) {

    const canvas = document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    const palettes = {
        mercury: ["#77736e", "#aaa39a", "#514e4a"],
        venus: ["#d8b66d", "#f2d79c", "#b88743"],
        mars: ["#9e4028", "#d77a4d", "#672b24"],
        jupiter: ["#bd825d", "#e6c49b", "#8f5944"],
        saturn: ["#b9a078", "#e5d3a8", "#8d7656"],
        uranus: ["#70cbd2", "#a0e3e2", "#4baab8"],
        neptune: ["#173c9a", "#326bd0", "#10245e"]
    };

    const colors = palettes[type];

    // Nền chuyển màu
    const gradient = ctx.createLinearGradient(
        0, 0, 0, canvas.height
    );

    gradient.addColorStop(0, colors[2]);
    gradient.addColorStop(0.5, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Các dải màu khí quyển
    const bandCount = type === "mercury" ? 0 : 45;

    for (let i = 0; i < bandCount; i++) {

        const y = Math.random() * canvas.height;
        const height = 3 + Math.random() * 20;

        ctx.fillStyle = colors[
            Math.floor(Math.random() * colors.length)
        ];

        ctx.globalAlpha = 0.12 + Math.random() * 0.2;

        ctx.fillRect(
            0,
            y,
            canvas.width,
            height
        );
    }

    ctx.globalAlpha = 1;

    // Miệng hố trên Sao Thủy
    if (type === "mercury") {

        for (let i = 0; i < 180; i++) {

            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 3 + Math.random() * 15;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);

            ctx.fillStyle = "#494641";
            ctx.globalAlpha = 0.35;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                x - radius * 0.15,
                y - radius * 0.15,
                radius * 0.75,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = "#d0c8bb";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
        }
    }

    // Vết Đỏ Lớn trên Sao Mộc
    if (type === "jupiter") {

        ctx.save();

        ctx.translate(680, 290);
        ctx.scale(1.7, 0.8);

        ctx.beginPath();
        ctx.ellipse(0, 0, 75, 38, -0.1, 0, Math.PI * 2);

        ctx.fillStyle = "#a94c35";
        ctx.globalAlpha = 0.85;
        ctx.fill();

        ctx.strokeStyle = "#e5b18c";
        ctx.lineWidth = 7;
        ctx.globalAlpha = 0.35;
        ctx.stroke();

        ctx.restore();
    }

    // Texture khí quyển của Sao Hải Vương
    if (type === "neptune") {

        for (let i = 0; i < 12; i++) {

            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            ctx.beginPath();
            ctx.ellipse(
                x, y,
                25 + Math.random() * 35,
                5 + Math.random() * 12,
                0, 0, Math.PI * 2
            );

            ctx.fillStyle = "#9ac8ff";
            ctx.globalAlpha = 0.3;
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}
const textureLoader = new THREE.TextureLoader();

const planetTextures = {

    mercury: createPlanetTexture("mercury"),

    venus: createPlanetTexture("venus"),

    mars: createPlanetTexture("mars"),

    jupiter: createPlanetTexture("jupiter"),

    saturn: createPlanetTexture("saturn"),

    uranus: createPlanetTexture("uranus"),

    neptune: createPlanetTexture("neptune"),
    earth: textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
),

};

// =================================
// 6. TẠO CÁC HÀNH TINH
// =================================


function createPlanet(name, radius, color, distance) {

    const planetGroup = new THREE.Group();

    const geometry = new THREE.SphereGeometry(
        radius,
        64,
        64
    );

const texture = planetTextures[name.toLowerCase()];

    const material = new THREE.MeshStandardMaterial({

    color: texture ? 0xffffff : color,

    map: texture || null,

    roughness: 0.9,

    metalness: 0

});

    const planet = new THREE.Mesh(
        geometry,
        material
    );

    planet.position.x = distance;

    planetGroup.add(planet);

    scene.add(planetGroup);

    return {
        name: name,
        group: planetGroup,
        mesh: planet
    };
}
const planets = [];

const orbits = [];

planets.forEach(planet => {

    const distance = planet.group.position.x;

    orbits.push(createOrbit(distance));

});

planets.push(createPlanet("Mercury", 0.7, 0xb5b5b5, 8));

planets.push(createPlanet("Venus", 1.1, 0xe6b566, 12));

planets.push(createPlanet("Earth", 1.2, 0x2878d0, 16));

planets.push(createPlanet("Mars", 0.9, 0xc65b3a, 20));

planets.push(createPlanet("Jupiter", 3.2, 0xd6a477, 28));

planets.push(createPlanet("Saturn", 2.7, 0xd8c18b, 37));

planets.push(createPlanet("Uranus", 1.9, 0x80dce5, 45));

planets.push(createPlanet("Neptune", 1.8, 0x3155c9, 52));

const planetSpeeds = [
    0.020,
    0.015,
    0.012,
    0.010,
    0.006,
    0.005,
    0.003,
    0.002
];

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.2
);

scene.add(ambientLight);

function createOrbit(distance) {

    const curve = new THREE.EllipseCurve(
        0, 0,
        distance, distance,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(200);

    const geometry = new THREE.BufferGeometry()
        .setFromPoints(
            points.map(point =>
                new THREE.Vector3(point.x, 0, point.y)
            )
        );

    const material = new THREE.LineBasicMaterial({
        color: 0x526078,
        transparent: true,
        opacity: 0.3
    });

    const orbit = new THREE.LineLoop(
        geometry,
        material
    );

    scene.add(orbit);

    return orbit;
}


// =================================
// VÀNH ĐAI SAO THỔ
// =================================

const saturn = planets.find(
    planet => planet.name === "Saturn"
);

const ringGeometry = new THREE.RingGeometry(
    3.5,
    5.2,
    128
);

const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9b58b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    roughness: 1
});

const saturnRing = new THREE.Mesh(
    ringGeometry,
    ringMaterial
);

saturnRing.rotation.x = -Math.PI / 2.5;

saturn.group.add(saturnRing);

// =================================
// 7. ANIMATION
// =================================

function animateSolarSystem() {

    requestAnimationFrame(animateSolarSystem);

    // Cập nhật điều khiển camera
    controls.update();
    // Chuyển động quỹ đạo các hành tinh
    planets.forEach((planet, index) => {

        planet.group.rotation.y += planetSpeeds[index];

    });

    // Tự xoay quanh trục
    planets.forEach((planet, index) => {

        planet.mesh.rotation.y += 0.005 / (index + 1);

    });
    // Xoay nền sao
    stars.rotation.y += 0.0001;
    stars.rotation.x += 0.00005;

    // Hiệu ứng nhịp đập của Mặt Trời
    sun.scale.setScalar(
        1 + Math.sin(Date.now() * 0.001) * 0.015
    );

    // Hiệu ứng quầng sáng
    sunGlow.scale.setScalar(
        1 + Math.sin(Date.now() * 0.0015) * 0.04
    );

    renderer.render(scene, camera);
}

const solarContainer = document.getElementById(
    "solarSystemContainer"
);

const clickHint = document.getElementById("clickHint");

window.showSolarSystem = function () {

    document.body.classList.add("solar-mode");

    solarContainer.classList.add("active");

    // Ẩn mũi tên trước
    clickHint.classList.remove("show");

    // Hiện mũi tên sau 5 giây
    setTimeout(() => {
        clickHint.classList.add("show");
    }, 5000);

};

animateSolarSystem();

window.showWelcomeScreen = function () {

    // Ẩn mũi tên
    clickHint.classList.remove("show");

    // Làm Hệ Mặt Trời biến mất
    solarContainer.classList.add("solar-exit");

    // Hiện màn hình chào mừng sau 1,2 giây
    setTimeout(() => {

        const welcomeScreen = document.getElementById("welcomeScreen");

        welcomeScreen.classList.add("show");

    }, 1200);

};