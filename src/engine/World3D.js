/**
 * ASTRAL ARENA 3D - ENGINE ĐỒ HỌA 3D & HIỆU ỨNG CHIÊU THỨC (Three.js)
 * Xử lý: Sảnh chờ 3D, Bản đồ Isometric 3v3 (2 trụ ngoài + 1 trụ chính mỗi phe),
 * Bụi cỏ, Bãi quái rừng, Hang Boss, Model nhân vật 3D theo Hệ/Skin và VFX.
 */
window.MOBA = window.MOBA || {};

(function (MOBA) {
  class World3D {
    constructor(containerId, uiLayerId) {
      this.container = document.getElementById(containerId);
      this.uiLayer = document.getElementById(uiLayerId);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x070c18);

      this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.5, 350);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.container.appendChild(this.renderer.domElement);

      this.raycaster = new THREE.Raycaster();
      this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      this.mode = 'LOBBY'; // 'LOBBY' | 'MATCH'
      this.lobbyGroup = new THREE.Group();
      this.arenaGroup = new THREE.Group();
      this.vfxList = [];
      this.showcaseMesh = null;

      // Vùng bụi cỏ trên bản đồ (Đứng trong bụi sẽ tàng hình với địch ở ngoài)
      this.bushes = [
        { x: -16, z: -6.5, r: 3.4 },
        { x: 0, z: -6.8, r: 3.6 },
        { x: 16, z: -6.5, r: 3.4 },
        { x: -12, z: 6.5, r: 3.4 },
        { x: 12, z: 6.5, r: 3.4 }
      ];

      this.setupLights();
      window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
      const ambient = new THREE.AmbientLight(0xdbeafe, 0.72);
      this.scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
      dirLight.position.set(25, 48, 30);
      dirLight.castShadow = true;
      this.scene.add(dirLight);
    }

    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    clearGroup(group) {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
      }
    }

    // ==================== 1. DỰNG SẢNH CHỜ 3D (LOBBY SHOWCASE) ====================
    setupLobbyScene(heroData, skinId) {
      this.mode = 'LOBBY';
      this.clearAllVFX();
      this.uiLayer.innerHTML = '';
      this.scene.remove(this.arenaGroup);
      this.clearGroup(this.lobbyGroup);

      // Bệ đứng phát sáng trong sảnh
      const pedGeo = new THREE.CylinderGeometry(2.6, 3.1, 0.5, 32);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.set(1.2, -0.25, 0);
      this.lobbyGroup.add(pedestal);

      const ringGeo = new THREE.RingGeometry(2.65, 2.95, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(1.2, 0.02, 0);
      this.lobbyGroup.add(ring);

      this.showcaseMesh = this.createHeroMesh(heroData, skinId, 'BLUE');
      this.showcaseMesh.position.set(1.2, 0, 0);
      this.showcaseMesh.scale.setScalar(1.35 * (heroData.visual.scale || 1));
      this.lobbyGroup.add(this.showcaseMesh);

      this.scene.add(this.lobbyGroup);
      this.camera.position.set(0.4, 3.2, 7.6);
      this.camera.lookAt(0.5, 1.5, 0);
    }

    // ==================== 2. DỰNG BẢN ĐỒ ĐẤU TRƯỜNG 3v3 ISOMETRIC ====================
    setupMatchArena() {
      this.mode = 'MATCH';
      this.clearAllVFX();
      this.uiLayer.innerHTML = '';
      this.scene.remove(this.lobbyGroup);
      this.clearGroup(this.arenaGroup);

      // Mặt đất tổng khu vực Rừng & Đấu trường
      const groundGeo = new THREE.BoxGeometry(116, 1, 48);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f241d, roughness: 0.9 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -0.5;
      this.arenaGroup.add(ground);

      // Đường chính (Main Lane thẳng ở giữa Z = 0)
      const laneGeo = new THREE.BoxGeometry(98, 0.12, 10.5);
      const laneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
      const lane = new THREE.Mesh(laneGeo, laneMat);
      lane.position.y = 0.02;
      this.arenaGroup.add(lane);

      // Viền phát sáng hai bên đường chính
      const borderGeo = new THREE.BoxGeometry(96, 0.16, 0.35);
      const blueBorderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const bNorth = new THREE.Mesh(borderGeo, blueBorderMat);
      bNorth.position.set(0, 0.05, -5.3);
      const bSouth = new THREE.Mesh(borderGeo, blueBorderMat);
      bSouth.position.set(0, 0.05, 5.3);
      this.arenaGroup.add(bNorth, bSouth);

      // Tế đàn Phe Xanh (Trái) & Phe Đỏ (Phải)
      this.createBasePad(-48, 0, 0x2563eb);
      this.createBasePad(48, 0, 0xdc2626);

      // Hang Boss Cánh Bắc (0, -14)
      const bossPitGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.18, 28);
      const bossPitMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, emissive: 0x581c87, emissiveIntensity: 0.35 });
      const bossPit = new THREE.Mesh(bossPitGeo, bossPitMat);
      bossPit.position.set(0, 0.04, -14);
      this.arenaGroup.add(bossPit);

      // Bãi Quái Rừng Cánh Nam & Cánh Bắc
      const campCoords = [
        { x: -20, z: 12, color: 0xef4444 }, // Bùa Đỏ bên Xanh
        { x: 20, z: 12, color: 0x3b82f6 },  // Bùa Xanh bên Đỏ
        { x: -22, z: -13, color: 0x10b981 }, // Bãi Sói Xanh
        { x: 22, z: -13, color: 0x10b981 }   // Bãi Sói Đỏ
      ];
      campCoords.forEach((c) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(2.5, 2.85, 24),
          new THREE.MeshBasicMaterial({ color: c.color, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(c.x, 0.05, c.z);
        this.arenaGroup.add(ring);
      });

      // Dựng các Bụi Cỏ 3D
      this.bushes.forEach((b) => {
        const bushGroup = new THREE.Group();
        const bushMat = new THREE.MeshStandardMaterial({
          color: 0x15803d,
          transparent: true,
          opacity: 0.72
        });
        for (let i = 0; i < 5; i++) {
          const tuft = new THREE.Mesh(new THREE.SphereGeometry(1.35, 10, 10), bushMat);
          tuft.position.set((i - 2) * 0.9, 0.75, (i % 2 === 0 ? 0.35 : -0.35));
          bushGroup.add(tuft);
        }
        bushGroup.position.set(b.x, 0, b.z);
        this.arenaGroup.add(bushGroup);
      });

      this.scene.add(this.arenaGroup);
    }

    createBasePad(x, z, colorHex) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 4.8, 0.25, 24),
        new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.3 })
      );
      pad.position.set(x, 0.05, z);
      this.arenaGroup.add(pad);
    }

    // ==================== 3. DỰNG MODEL NHÂN VẬT 3D THEO ĐẶC TÍNH & SKIN ====================
    createHeroMesh(heroData, skinId, team) {
      const skin = (heroData.skins || []).find((s) => s.id === skinId) || heroData.skins[0];
      const bodyColor = skin ? skin.bodyColor : heroData.visual.bodyColor;
      const weaponColor = skin ? skin.weaponColor : heroData.visual.weaponColor;
      const accentColor = heroData.visual.accentColor;

      const root = new THREE.Group();

      // Vòng hào quang phân biệt Phe Xanh / Phe Đỏ dưới chân
      const teamRingColor = team === 'BLUE' ? 0x38bdf8 : 0xf87171;
      const baseRing = new THREE.Mesh(
        new THREE.RingGeometry(1.0, 1.22, 24),
        new THREE.MeshBasicMaterial({ color: teamRingColor, side: THREE.DoubleSide })
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = 0.06;
      root.add(baseRing);

      // Thân giáp chính (Torso)
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.45 });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.65, 1.45, 12), bodyMat);
      torso.position.y = 1.1;
      root.add(torso);

      // Giáp vai
      const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.25 });
      const leftPad = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.48), accentMat);
      leftPad.position.set(-0.65, 1.65, 0);
      const rightPad = leftPad.clone();
      rightPad.position.x = 0.65;
      root.add(leftPad, rightPad);

      // Đầu nhân vật & Mắt phát sáng
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
      );
      head.position.y = 2.15;
      root.add(head);

      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.14, 0.25),
        new THREE.MeshBasicMaterial({ color: weaponColor })
      );
      visor.position.set(0, 2.18, 0.32);
      root.add(visor);

      // Khớp Vũ khí đặc trưng theo từng nhân vật
      const weaponGroup = new THREE.Group();
      weaponGroup.position.set(0.75, 1.35, 0.35);
      const wepMat = new THREE.MeshStandardMaterial({
        color: weaponColor,
        emissive: weaponColor,
        emissiveIntensity: 0.55,
        metalness: 0.7
      });

      const wType = heroData.visual.weaponType;
      if (wType === 'staff') {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.3, 8), wepMat);
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.32), wepMat);
        orb.position.y = 1.25;
        weaponGroup.add(pole, orb);
      } else if (wType === 'orbs') {
        const orb1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), wepMat);
        const orb2 = orb1.clone();
        orb1.position.set(0.1, 0.5, 0.2);
        orb2.position.set(-1.5, 0.5, 0.2);
        weaponGroup.add(orb1, orb2);
      } else if (wType === 'shield_mace' || wType === 'spear_shield') {
        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.35, 0.95), wepMat);
        shield.position.set(-1.5, 0, 0.2);
        const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.9, 8), wepMat);
        spear.rotation.x = Math.PI / 3;
        weaponGroup.add(shield, spear);
      } else if (wType === 'daggers') {
        const dag1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.95, 6), wepMat);
        dag1.rotation.x = Math.PI / 2;
        const dag2 = dag1.clone();
        dag2.position.x = -1.5;
        weaponGroup.add(dag1, dag2);
      } else if (wType === 'axe' || wType === 'halberd') {
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8), wepMat);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.65), wepMat);
        blade.position.set(0, 0.8, 0.25);
        weaponGroup.add(shaft, blade);
      } else {
        // Đại kiếm / Katana
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.28), wepMat);
        sword.position.y = 0.5;
        weaponGroup.add(sword);
      }

      root.add(weaponGroup);
      root.userData.weaponGroup = weaponGroup;
      root.userData.bodyMat = bodyMat;
      return root;
    }

    // Dựng Trụ (Tier 1, Tier 2) và Nhà Chính (Nexus)
    createStructureMesh(team, tier) {
      const group = new THREE.Group();
      const color = team === 'BLUE' ? 0x2563eb : 0xdc2626;
      const crystalColor = team === 'BLUE' ? 0x38bdf8 : 0xf87171;

      const isNexus = tier === 3;
      const radius = isNexus ? 2.1 : 1.25;
      const height = isNexus ? 4.2 : 3.1;

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.8, radius * 1.1, height, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
      );
      base.position.y = height / 2;
      group.add(base);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(isNexus ? 1.15 : 0.72),
        new THREE.MeshStandardMaterial({ color: crystalColor, emissive: color, emissiveIntensity: 0.7 })
      );
      crystal.position.y = height + 0.85;
      group.add(crystal);
      group.userData.crystal = crystal;
      return group;
    }

    // Dựng Lính / Quái Rừng / Boss
    createMobMesh(kind, team) {
      const group = new THREE.Group();
      if (kind === 'BOSS') {
        const body = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1.75),
          new THREE.MeshStandardMaterial({ color: 0x581c87, emissive: 0xa855f7, emissiveIntensity: 0.45 })
        );
        body.position.y = 2.0;
        group.add(body);
      } else if (kind === 'JUNGLE') {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 1.35, 1.1),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
        );
        body.position.y = 0.75;
        group.add(body);
      } else {
        // Lính đường chính
        const color = team === 'BLUE' ? 0x3b82f6 : 0xef4444;
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.44, 0.95, 8),
          new THREE.MeshStandardMaterial({ color })
        );
        body.position.y = 0.5;
        group.add(body);
      }
      return group;
    }

    // ==================== 4. HỆ THỐNG HIỆU ỨNG CHIÊU THỨC 3D (VFX) ====================
    spawnVFX(type, x, z, colorHex, radius = 3.0, duration = 0.55) {
      const group = new THREE.Group();
      group.position.set(x, 0.15, z);

      if (type === 'aoe' || type === 'storm' || type === 'shield_aoe') {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.3, radius, 28),
          new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
        );
        ring.rotation.x = -Math.PI / 2;
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 1.6, 20, 1, true),
          new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
        );
        cyl.position.y = 0.8;
        group.add(ring, cyl);
      } else if (type === 'meteor') {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 0.55, 16, 16),
          new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 })
        );
        sphere.position.y = 5.5;
        group.add(sphere);
        group.userData.meteorSphere = sphere;
      } else if (type === 'celestial_p08') {
        // Hiệu ứng đặc biệt khi Thiên Kiếm (P08) kích hoạt Bất Tử 2s
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(1.75, 18, 18),
          new THREE.MeshBasicMaterial({ color: 0xfef08a, wireframe: true, transparent: true, opacity: 0.9 })
        );
        dome.position.y = 1.2;
        group.add(dome);
      } else {
        // Sóng chém / Đâm thương
        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius, 0.25, 18),
          new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7 })
        );
        group.add(disc);
      }

      this.arenaGroup.add(group);
      this.vfxList.push({ mesh: group, elapsed: 0, duration, type });
    }

    spawnFloatingText(x, y, z, text, color = '#fef08a') {
      const pos = this.worldToScreen(x, y, z);
      if (!pos.visible) return;
      const div = document.createElement('div');
      div.className = 'float-dmg-text';
      div.style.left = `${pos.x}px`;
      div.style.top = `${pos.y}px`;
      div.style.color = color;
      div.textContent = text;
      this.uiLayer.appendChild(div);
      setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
      }, 850);
    }

    updateVFX(dt) {
      for (let i = this.vfxList.length - 1; i >= 0; i--) {
        const v = this.vfxList[i];
        v.elapsed += dt;
        const progress = Math.min(1, v.elapsed / v.duration);
        if (v.mesh.userData.meteorSphere) {
          v.mesh.userData.meteorSphere.position.y = 5.5 * (1 - progress);
        }
        v.mesh.rotation.y += dt * 4.5;
        if (v.elapsed >= v.duration) {
          this.arenaGroup.remove(v.mesh);
          this.vfxList.splice(i, 1);
        }
      }
    }

    clearAllVFX() {
      this.vfxList.forEach((v) => this.arenaGroup.remove(v.mesh));
      this.vfxList = [];
    }

    worldToScreen(x, y, z) {
      const vec = new THREE.Vector3(x, y, z);
      vec.project(this.camera);
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      return {
        x: vec.x * halfW + halfW,
        y: -(vec.y * halfH) + halfH,
        visible: vec.z < 1
      };
    }

    getGroundPointFromMouse(clientX, clientY) {
      const mouse = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      );
      this.raycaster.setFromCamera(mouse, this.camera);
      const target = new THREE.Vector3();
      const hit = this.raycaster.ray.intersectPlane(this.groundPlane, target);
      return hit ? target : null;
    }

    isInsideBush(x, z) {
      for (let i = 0; i < this.bushes.length; i++) {
        const b = this.bushes[i];
        const dx = x - b.x;
        const dz = z - b.z;
        if (dx * dx + dz * dz <= b.r * b.r) return true;
      }
      return false;
    }

    render(dt, playerUnit) {
      if (this.mode === 'LOBBY' && this.showcaseMesh) {
        this.showcaseMesh.rotation.y += dt * 0.85;
      } else if (this.mode === 'MATCH' && playerUnit) {
        // Camera Isometric bám mượt theo nhân vật người chơi
        const targetCamX = playerUnit.x;
        const targetCamZ = playerUnit.z + 21;
        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.12;
        this.camera.position.y = 24;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.12;
        this.camera.lookAt(this.camera.position.x, 0, this.camera.position.z - 21);
        this.updateVFX(dt);
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  MOBA.World3D = World3D;
})(window.MOBA);
