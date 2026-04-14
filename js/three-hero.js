/* =========================================================
   EliteEstates — three-hero.js
   Three.js animated 3D hero background:
   Floating geometric particles + subtle wireframe mesh
   ========================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ---------------------------------------------------------
     SCENE SETUP
     --------------------------------------------------------- */
  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  let W = window.innerWidth;
  let H = window.innerHeight;
  renderer.setSize(W, H);

  const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 1000);
  camera.position.set(0, 0, 30);

  /* ---------------------------------------------------------
     PARTICLE FIELD
     --------------------------------------------------------- */
  const PARTICLE_COUNT = 600;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  const colors     = new Float32Array(PARTICLE_COUNT * 3);

  // Gold & white palette
  const palette = [
    new THREE.Color(0xC8963E), // gold
    new THREE.Color(0xE8B86D), // light gold
    new THREE.Color(0xFFFFFF), // white
    new THREE.Color(0x2E5F8A), // medium blue
    new THREE.Color(0x5A9FD4), // sky blue
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    // Spread in 3D space
    positions[i3]     = (Math.random() - 0.5) * 80;
    positions[i3 + 1] = (Math.random() - 0.5) * 80;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    velocities.push({
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.012,
      z: (Math.random() - 0.5) * 0.008,
    });

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---------------------------------------------------------
     WIREFRAME SPHERE (architectural feel)
     --------------------------------------------------------- */
  const sphereGeo = new THREE.IcosahedronGeometry(12, 2);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x2E5F8A,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(12, -4, -10);
  scene.add(sphere);

  /* ---------------------------------------------------------
     SECOND WIREFRAME SHAPE (octahedron)
     --------------------------------------------------------- */
  const octaGeo = new THREE.OctahedronGeometry(6, 2);
  const octaMat = new THREE.MeshBasicMaterial({
    color: 0xC8963E,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });
  const octa = new THREE.Mesh(octaGeo, octaMat);
  octa.position.set(-16, 6, -15);
  scene.add(octa);

  /* ---------------------------------------------------------
     FLOATING GEOMETRIES (accent shapes)
     --------------------------------------------------------- */
  const floatingShapes = [];

  function createFloatingShape(geoType, size, x, y, z, color) {
    let geo;
    switch (geoType) {
      case 'tetra':  geo = new THREE.TetrahedronGeometry(size); break;
      case 'octa':   geo = new THREE.OctahedronGeometry(size);  break;
      default:       geo = new THREE.IcosahedronGeometry(size, 0);
    }
    const mat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.012,
      rotY: (Math.random() - 0.5) * 0.012,
      rotZ: (Math.random() - 0.5) * 0.008,
      floatAmp: 0.8 + Math.random() * 1.2,
      floatSpeed: 0.4 + Math.random() * 0.6,
      originY: y,
    };
    scene.add(mesh);
    floatingShapes.push(mesh);
  }

  createFloatingShape('tetra',  2.0, -18,  8, -5,  0xC8963E);
  createFloatingShape('icosa',  1.5,  20,  10, -8, 0xE8B86D);
  createFloatingShape('octa',   2.5, -8,  -12, -12, 0x5A9FD4);
  createFloatingShape('tetra',  1.2,  14, -10, -4,  0xFFFFFF);
  createFloatingShape('icosa',  1.8,  0,   14, -18, 0x2E5F8A);

  /* ---------------------------------------------------------
     CONNECTING LINES between nearby particles
     --------------------------------------------------------- */
  const LINE_DISTANCE = 14;
  const linePositions = [];
  const lineColors    = [];

  // Sample a subset for performance
  const sample = Math.min(80, PARTICLE_COUNT);
  for (let i = 0; i < sample; i++) {
    for (let j = i + 1; j < sample; j++) {
      const i3 = i * 3, j3 = j * 3;
      const dx = positions[i3] - positions[j3];
      const dy = positions[i3+1] - positions[j3+1];
      const dz = positions[i3+2] - positions[j3+2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < LINE_DISTANCE) {
        linePositions.push(positions[i3], positions[i3+1], positions[i3+2]);
        linePositions.push(positions[j3], positions[j3+1], positions[j3+2]);
        const alpha = 1 - dist / LINE_DISTANCE;
        lineColors.push(0.78, 0.59, 0.24, alpha); // gold
        lineColors.push(0.78, 0.59, 0.24, alpha);
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xC8963E,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegments);

  /* ---------------------------------------------------------
     MOUSE PARALLAX
     --------------------------------------------------------- */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / W - 0.5) * 2;
    mouseY = (e.clientY / H - 0.5) * 2;
  });

  /* ---------------------------------------------------------
     ANIMATION LOOP
     --------------------------------------------------------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse parallax camera shift
    targetX += (mouseX * 3 - targetX) * 0.04;
    targetY += (-mouseY * 2 - targetY) * 0.04;
    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(scene.position);

    // Animate particles (drift)
    const pos = particleGeo.attributes.position.array;
    const BOUND = 40;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      pos[i3 + 2] += velocities[i].z;
      // Wrap around bounds
      if (pos[i3]     >  BOUND) pos[i3]     = -BOUND;
      if (pos[i3]     < -BOUND) pos[i3]     =  BOUND;
      if (pos[i3 + 1] >  BOUND) pos[i3 + 1] = -BOUND;
      if (pos[i3 + 1] < -BOUND) pos[i3 + 1] =  BOUND;
      if (pos[i3 + 2] >  30)    pos[i3 + 2] = -30;
      if (pos[i3 + 2] < -30)    pos[i3 + 2] =  30;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Pulse particle opacity
    particleMat.opacity = 0.65 + Math.sin(elapsed * 0.4) * 0.1;

    // Slow rotation of main wireframe structures
    sphere.rotation.x = elapsed * 0.06;
    sphere.rotation.y = elapsed * 0.09;
    octa.rotation.x   = elapsed * 0.08;
    octa.rotation.y   = elapsed * 0.05;

    // Animate floating shapes
    floatingShapes.forEach(shape => {
      const { rotX, rotY, rotZ, floatAmp, floatSpeed, originY } = shape.userData;
      shape.rotation.x += rotX;
      shape.rotation.y += rotY;
      shape.rotation.z += rotZ;
      shape.position.y  = originY + Math.sin(elapsed * floatSpeed) * floatAmp;
    });

    // Slow overall particle system drift
    particles.rotation.y = elapsed * 0.008;

    renderer.render(scene, camera);
  }

  animate();

  // Mark canvas as ready (fade in)
  setTimeout(() => canvas.classList.add('ready'), 200);

  /* ---------------------------------------------------------
     RESIZE HANDLER
     --------------------------------------------------------- */
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

})();
