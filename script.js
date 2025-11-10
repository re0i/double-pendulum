let g_el, m1_el, m2_el, L1_el, L2_el;
let g, m1, m2, L1, L2;
let m1Color_el, m2Color_el, L1Color_el, L2Color_el;
let m1Color, m2Color, L1Color, L2Color;
let mouseInteraction, drag, push, pushPower_el, pushPower;
let draggingBob = null;

const dt = 0.02;
let dampping = 0.9999;
let pushRadius = 80;

let theta1 = Math.PI / 2;
let theta2 = Math.PI / 2;
let theta1_v = 0 * dt;
let theta2_v = 0 * dt;
let theta1_a = 0 * dt;
let theta2_a = 0 * dt;

let x1, y1, x2, y2;
let trail = [];
let trail2 = [];

function setup(){
    createCanvas(windowWidth - 40, windowHeight - 40);

    g_el = select('#gravity');
    m1_el = select('#m1');
    m2_el = select('#m2');
    L1_el = select('#l1');
    L2_el = select('#l2');
    mouseInteraction = select('#mouse');
    drag = select('#drag');
    push = select('#push');
    m1Color_el = select('#color-bob-1');
    m2Color_el = select('#color-bob-2');
    L1Color_el = select('#color-rod-1');
    L2Color_el = select('#color-rod-2');
    pushPower_el = select('#push-power');
    

    g = parseFloat(g_el.value());
    m1 = parseFloat(m1_el.value());
    m2 = parseFloat(m2_el.value());
    L1 = parseFloat(L1_el.value());
    L2 = parseFloat(L2_el.value());
    pushPower = parseFloat(pushPower_el.value());
    m1Color = m1Color_el.value();
    m2Color = m2Color_el.value();
    L1Color = L1Color_el.value();
    L2Color = L2Color_el.value();

    toggleMouseOptions(false);

    mouseInteraction.changed(() => {
        toggleMouseOptions(mouseInteraction.elt.checked);
    });

    push.changed(() => {
        pushPower_el.elt.disabled = !push.elt.checked;
    });

    drag.changed(() => {
        pushPower_el.elt.disabled = true;
    });
}

function toggleMouseOptions(enabled){
    drag.elt.disabled = !enabled;
    push.elt.disabled = !enabled;
    pushPower_el.elt.disabled = !enabled || !push.elt.checked;
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
    theta1_v *= dampping;
    theta2_v *= dampping;

    trail.push({ x: x2, y: y2 });
    if (trail.length > 5000) trail.shift();
    trail2.push({ x: x1, y: y1 });
    if (trail2.length > 5000) trail2.shift();
}

function mousePressed(){
    if (!mouseInteraction.elt.checked) return;

    if (push.elt.checked){
        mousePush();
    } else if (drag.elt.checked){
        let d1 = dist(mouseX, mouseY, x1, y1);
        let d2 = dist(mouseX, mouseY, x2, y2);
        
        if (d1 < m1) {
            draggingBob = 1;
        } else if (d2 < m2) {
            draggingBob = 2;
        } else {
            draggingBob = null;
        }
    }
}

function mouseDragged(){
    if (!mouseInteraction.elt.checked || !drag.elt.checked) return;

    if (draggingBob === 1) {
        let dx = mouseX - width / 2;
        let dy = mouseY - height / 4;
        theta1 = Math.atan2(dx, dy);
        theta1_v = Math.sqrt(dx * dx + dy * dy) * 0.01 * (dy < 0 ? -1 : 1);
        dampping = 1;
    } else if (draggingBob === 2) {
        let dx = mouseX - x1;
        let dy = mouseY - y1;
        theta2 = Math.atan2(dx, dy);
        theta2_v = Math.sqrt(dx * dx + dy * dy) * 0.01 * (dy < 0 ? -1 : 1);
        dampping = 1;
    }
}

function mouseReleased(){
    draggingBob = null;
    dampping = 0.9999;
    loop();
}

function mousePush(){
    if (!mouseInteraction.elt.checked || !push.elt.checked) return;

    let dx1 = mouseX - x1;
    let dy1 = mouseY - y1;
    let d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    if(d1 < pushRadius){
        let ux = dx1 / d1;
        let uy = dy1 / d1;

        let tx = uy;
        let ty = -ux;
        let push = pushPower * (1 - d1 / pushRadius);
        theta1_v += (push * (tx * L1 + ty * L1)) / L1;
    }

    let dx2 = mouseX - x1;
    let dy2 = mouseY - y1;
    let d2 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    if(d2 < pushRadius){
        let ux = dx2 / d2;
        let uy = dy2 / d2;
        let tx = uy;
        let ty = -ux;

        let push = pushPower * (1 - d2 / pushRadius);
        theta2_v += (push * (tx * L2 + ty * L2)) / L2;
    }
}


function draw(){
    background(0);
    if (!draggingBob) update();

    [g_el, m1_el, m2_el, L1_el, L2_el, m1Color_el, m2Color_el, L1Color_el, L2Color_el].forEach(el =>
        el.input(() =>{
            g = parseFloat(g_el.value());
            m1 = parseFloat(m1_el.value());
            m2 = parseFloat(m2_el.value());
            L1 = parseFloat(L1_el.value());
            L2 = parseFloat(L2_el.value());
            m1Color = m1Color_el.value();
            m2Color = m2Color_el.value();
            L1Color = L1Color_el.value();
            L2Color = L2Color_el.value();
        })
    );

    let originX = width / 2;
    let originY = height / 4;

    x1 = originX + L1 * Math.sin(theta1);
    y1 = originY + L1 * Math.cos(theta1);
    x2 = x1 + L2 * Math.sin(theta2);
    y2 = y1 + L2 * Math.cos(theta2);

    // Rods
    stroke(L1Color);
    strokeWeight(2);
    line(originX, originY, x1, y1);
    stroke(L2Color);
    strokeWeight(2);
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

    noFill();
    stroke(225);
    strokeWeight(0);
    beginShape();
    for (let pos of trail2) {
        vertex(pos.x, pos.y);
    }
    endShape();

    // Bobs
    fill(m1Color);
    ellipse(x1, y1, m1, m1);
    fill(m2Color);
    ellipse(x2, y2, m2, m2);
}