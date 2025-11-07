let g_el, m1_el, m2_el, L1_el, L2_el;
let g, m1, m2, L1, L2;

const dt = 0.01;

let theta1 = Math.PI / 2;
let theta2 = Math.PI / 2;
let theta1_v = 0 * dt;
let theta2_v = 0 * dt;
let theta1_a = 0 * dt;
let theta2_a = 0 * dt;

let x1, y1, x2, y2;
let trail = [];

function setup(){
    createCanvas(800, 600);

    g_el = select('#gravity');
    m1_el = select('#m1');
    m2_el = select('#m2');
    L1_el = select('#l1');
    L2_el = select('#l2');

    g = parseFloat(g_el.value());
    m1 = parseFloat(m1_el.value());
    m2 = parseFloat(m2_el.value());
    L1 = parseFloat(L1_el.value());
    L2 = parseFloat(L2_el.value());

    [g_el, m1_el, m2_el, L1_el, L2_el].forEach(el =>
        el.input(() =>{
            g = parseFloat(g_el.value());
            m1 = parseFloat(m1_el.value());
            m2 = parseFloat(m2_el.value());
            L1 = parseFloat(L1_el.value());
            L2 = parseFloat(L2_el.value());
        })
    );
}

function getAccelerations(theta1, theta2, theta1_v, theta2_v){
    const num1 = -g * ( 2 * m1 + m2) * Math.sin(theta1) - m2 * g * Math.sin(theta1 - 2 * theta2) - 2 * Math.sin(theta1 - theta2) * m2 * (theta2_v ** 2 * L2 + theta1_v ** 2 * L1 * Math.cos(theta1 - theta2));
    const den1 = L1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
    theta1_a = num1 / den1;

    const num2 = 2 * Math.sin(theta1 - theta2) * (theta1_v ** 2 * L1 * (m1 + m2) + g * (m1 + m2) * Math.cos(theta1) + theta2_v ** 2 * L2 * m2 * Math.cos(theta1 - theta2));
    const den2 = L2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
    theta2_a = num2 / den2;

    return [theta1_a, theta2_a];
}

function update(){
    // k1 rates
    const k1_v1 = theta1_v * dt;
    const k1_v2 = theta2_v * dt;
    const [k1_a1, k1_a2] = getAccelerations(theta1, theta2, theta1_v, theta2_v);
    const k1_a1_dt = k1_a1 * dt;
    const k1_a2_dt = k1_a2 * dt;

    // k2 rates
    const k2_v1 = (theta1_v + k1_a1_dt / 2) * dt;
    const k2_v2 = (theta2_v + k1_a2_dt / 2) * dt;
    const [k2_a1, k2_a2] = getAccelerations(
        theta1 + k1_v1 / 2,
        theta2 + k1_v2 / 2,
        theta1_v + k1_a1_dt / 2,
        theta2_v + k1_a2_dt / 2
    );
    const k2_a1_dt = k2_a1 * dt;
    const k2_a2_dt = k2_a2 * dt;

    // k3 rates
    const k3_v1 = (theta1_v + k2_a1_dt / 2) * dt;
    const k3_v2 = (theta2_v + k2_a2_dt / 2) * dt;
    const [k3_a1, k3_a2] = getAccelerations(
        theta1 + k2_v1 / 2,
        theta2 + k2_v2 / 2,
        theta1_v + k2_a1_dt / 2,
        theta2_v + k2_a2_dt / 2
    );
    const k3_a1_dt = k3_a1 * dt;
    const k3_a2_dt = k3_a2 * dt;

    // k4 rates
    const k4_v1 = (theta1_v + k3_a1_dt) * dt;
    const k4_v2 = (theta2_v + k3_a2_dt) * dt;
    const [k4_a1, k4_a2] = getAccelerations(
        theta1 + k3_v1,
        theta2 + k3_v2,
        theta1_v + k3_a1_dt,
        theta2_v + k3_a2_dt
    );
    const k4_a1_dt = k4_a1 * dt;
    const k4_a2_dt = k4_a2 * dt;


    theta1 += (k1_v1 + 2 * k2_v1 + 2 * k3_v1 + k4_v1) / 6;
    theta2 += (k1_v2 + 2 * k2_v2 + 2 * k3_v2 + k4_v2) / 6;

    theta1_v += (k1_a1_dt + 2 * k2_a1_dt + 2 * k3_a1_dt + k4_a1_dt) / 6;
    theta2_v += (k1_a2_dt + 2 * k2_a2_dt + 2 * k3_a2_dt + k4_a2_dt) / 6;

    // Dampping
    theta1_v *= 0.99995;
    theta2_v *= 0.99995;

    trail.push({ x: x2, y: y2 });
    if (trail.length > 5000) trail.shift();
}

function draw(){
    background(0);
    update();

    let originX = width / 2;
    let originY = 100;

    x1 = originX + L1 * Math.sin(theta1);
    y1 = originY + L1 * Math.cos(theta1);
    x2 = x1 + L2 * Math.sin(theta2);
    y2 = y1 + L2 * Math.cos(theta2);

    // Rods
    stroke(225);
    strokeWeight(2);
    line(originX, originY, x1, y1);
    line(x1, y1, x2, y2);

    // Trail
    noFill();
    stroke(225);
    strokeWeight(1);
    beginShape();
    for (let pos of trail) {
        vertex(pos.x, pos.y);
    }
    endShape();

    // Bobs
    fill(225, 100, 100);
    ellipse(x1, y1, 30, 30);
    fill(100, 225, 100);
    ellipse(x2, y2, 30, 30);
}