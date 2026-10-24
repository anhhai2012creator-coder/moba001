/**
 * ASTRAL ARENA 3D - TRUNG TÂM ĐIỀU KHIỂN SẢNH, CHIẾN ĐẤU, TRANG BỊ & AI BOT (v1.0.0)
 * Đã tích hợp đầy đủ:
 * - P01: +200 Công VL
 * - P08 (Celestial Sword - Thiên Kiếm): +100 Công VL, Nội tại nhận ST chí tử -> Bất tử + Miễn choáng 2s.
 * - Hệ thống Lính, Quái rừng, Boss, 4 Cấp độ AI theo 14 Bậc Rank.
 */
window.MOBA = window.MOBA || {};

(function (MOBA) {
  const { ITEMS, HEROES, RANKS, getRankByStars } = MOBA.DATA;

  class GameController {
    constructor() {
      this.world = new MOBA.World3D('webgl-container', 'world-ui-layer');
      this.saveData = this.loadProfile();

      this.showcaseIndex = 0;
      this.selectedHeroId = 'aurelia';
      this.selectedRoleFilter = 'ALL';
      this.selectedShopTab = 'heroes';
      this.selectedItemCat = 'ALL';

      // Trạng thái trận đấu
      this.matchActive = false;
      this.matchTime = 0;
      this.waveTimer = 2.0;
      this.waveCount = 0;
      this.goldTickTimer = 0;
      this.units = [];
      this.projectiles = [];
      this.player = null;
      this.scoreBlue = 0;
      this.scoreRed = 0;
      this.firstBloodTaken = false;
      this.bossNextSpawn = 120; // Boss xuất hiện lúc 02:00
      this.bossAlive = false;

      // Điều khiển Bàn phím & Joystick
      this.keys = {};
      this.joyVec = { x: 0, z: 0 };
      this.moveTarget = null;

      this.initUIEvents();
      this.initControls();
      this.refreshLobbyUI();
      this.world.setupLobbyScene(HEROES[this.showcaseIndex], this.getEquippedSkin(HEROES[this.showcaseIndex].id));

      this.lastFrameTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // ==================== 1. LƯU TRỮ HỒ SƠ NGƯỜI CHƠI ====================
    loadProfile() {
      const raw = localStorage.getItem('ASTRAL_MOBA_V100');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.warn('Khởi tạo lại hồ sơ lưu trữ.');
        }
      }
      return {
        gold: 18888,
        diamond: 600,
        ruby: 150,
        stars: 0,
        rankPoints: 0, // Dùng cho Bậc 7 (Sử Thi) trở lên: 100 RP = 1 Sao
        braveryPoints: 50, // Điểm Tinh Túy bảo hộ sao
        highestRankId: 1,
        ownedHeroes: ['aurelia', 'vanguard', 'valerius'],
        ownedSkins: { aurelia: ['default'], vanguard: ['default'], valerius: ['default'] },
        equippedSkins: { aurelia: 'default', vanguard: 'default', valerius: 'default' }
      };
    }

    saveProfile() {
      localStorage.setItem('ASTRAL_MOBA_V100', JSON.stringify(this.saveData));
      this.refreshLobbyUI();
    }

    getEquippedSkin(heroId) {
      return (this.saveData.equippedSkins && this.saveData.equippedSkins[heroId]) || 'default';
    }

    showToast(msg) {
      const box = document.getElementById('toast-container');
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.textContent = msg;
      box.appendChild(item);
      setTimeout(() => {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 2600);
    }

    addFeedBanner(msg) {
      const feed = document.getElementById('hud-banner-feed');
      const div = document.createElement('div');
      div.className = 'feed-msg';
      div.textContent = msg;
      feed.appendChild(div);
      setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
      }, 3200);
    }

    // ==================== 2. GIAO DIỆN SẢNH CHỜ, NHÂN VẬT, CỬA HÀNG, RANK ====================
    refreshLobbyUI() {
      document.getElementById('res-gold').textContent = this.saveData.gold.toLocaleString();
      document.getElementById('res-diamond').textContent = this.saveData.diamond.toLocaleString();
      document.getElementById('res-ruby').textContent = this.saveData.ruby.toLocaleString();

      const rInfo = getRankByStars(this.saveData.stars);
      document.getElementById('lobby-rank-mini').textContent = `${rInfo.fullTitle} | Tinh Túy: ${this.saveData.braveryPoints}`;
      document.getElementById('play-btn-rank-sub').textContent = `Rank: ${rInfo.tier.name} (${rInfo.starsInTier} Sao)`;

      const hero = HEROES[this.showcaseIndex];
      const skinId = this.getEquippedSkin(hero.id);
      const skinObj = hero.skins.find((s) => s.id === skinId) || hero.skins[0];
      document.getElementById('showcase-role').textContent = `HỆ: ${hero.roleVi.toUpperCase()}`;
      document.getElementById('showcase-name').textContent = hero.name;
      document.getElementById('showcase-title').textContent = hero.title;
      document.getElementById('showcase-skin').textContent = `Skin: ${skinObj.name}`;
      document.getElementById('lobby-avatar').textContent = hero.icon;
    }

    initUIEvents() {
      // Đổi tướng trưng bày ở Sảnh
      document.getElementById('btn-prev-showcase').addEventListener('click', () => {
        this.showcaseIndex = (this.showcaseIndex - 1 + HEROES.length) % HEROES.length;
        const h = HEROES[this.showcaseIndex];
        this.world.setupLobbyScene(h, this.getEquippedSkin(h.id));
        this.refreshLobbyUI();
      });

      document.getElementById('btn-next-showcase').addEventListener('click', () => {
        this.showcaseIndex = (this.showcaseIndex + 1) % HEROES.length;
        const h = HEROES[this.showcaseIndex];
        this.world.setupLobbyScene(h, this.getEquippedSkin(h.id));
        this.refreshLobbyUI();
      });

      // Mở 3 nút ngoài Sảnh Chờ
      document.getElementById('btn-open-heroes').addEventListener('click', () => {
        this.renderHeroesModal();
        document.getElementById('modal-heroes').classList.remove('hidden');
      });

      document.getElementById('btn-open-shop').addEventListener('click', () => {
        this.renderShopModal();
        document.getElementById('modal-shop').classList.remove('hidden');
      });

      document.getElementById('btn-open-ranked').addEventListener('click', () => {
        this.renderRankedModal();
        document.getElementById('modal-ranked').classList.remove('hidden');
      });

      document.getElementById('btn-quick-ranked').addEventListener('click', () => {
        this.openDraftModal();
      });

      // Đóng các Modal
      document.querySelectorAll('.btn-close-modal').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-close');
          document.getElementById(target).classList.add('hidden');
        });
      });

      // Bộ lọc Modal Nhân Vật
      document.querySelectorAll('#hero-role-filters .tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#hero-role-filters .tab-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedRoleFilter = btn.getAttribute('data-filter');
          this.renderHeroesModal();
        });
      });

      // Bộ lọc Modal Cửa Hàng
      document.querySelectorAll('#shop-tab-buttons .tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#shop-tab-buttons .tab-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedShopTab = btn.getAttribute('data-shoptab');
          this.renderShopModal();
        });
      });

      // Nút Bắt đầu trận đấu từ màn hình Chọn Tướng
      document.getElementById('btn-launch-match').addEventListener('click', () => {
        document.getElementById('modal-draft').classList.add('hidden');
        this.start3v3Match(this.selectedHeroId);
      });

      // Nút mở Shop Trang bị trong trận
      document.getElementById('btn-open-ingame-shop').addEventListener('click', () => {
        this.renderIngameShopModal();
        document.getElementById('modal-ingame-shop').classList.remove('hidden');
      });

      document.querySelectorAll('#ingame-shop-tabs .tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#ingame-shop-tabs .tab-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedItemCat = btn.getAttribute('data-itemcat');
          this.renderIngameShopModal();
        });
      });

      // Nút rời trận về sảnh
      document.getElementById('btn-leave-match').addEventListener('click', () => {
        this.endMatch(false, true);
      });
    }

    // Hiển thị danh sách Nhân Vật (Đã có / Chưa có + Chi tiết kỹ năng + Đổi Skin)
    renderHeroesModal() {
      const grid = document.getElementById('heroes-grid-container');
      const detail = document.getElementById('hero-detail-panel');
      grid.innerHTML = '';

      const filtered = HEROES.filter((h) => {
        const isOwned = this.saveData.ownedHeroes.includes(h.id);
        if (this.selectedRoleFilter === 'OWNED') return isOwned;
        if (this.selectedRoleFilter === 'UNOWNED') return !isOwned;
        if (this.selectedRoleFilter !== 'ALL') return h.role === this.selectedRoleFilter;
        return true;
      });

      filtered.forEach((h) => {
        const isOwned = this.saveData.ownedHeroes.includes(h.id);
        const card = document.createElement('div');
        card.className = `hero-card ${isOwned ? 'owned' : 'unowned'} ${this.selectedHeroId === h.id ? 'selected' : ''}`;
        card.innerHTML = `
          <span class="hero-badge-status ${isOwned ? 'status-owned' : 'status-locked'}">${isOwned ? 'ĐÃ CÓ' : 'CHƯA CÓ'}</span>
          <div class="hero-color-orb" style="background:#${h.visual.bodyColor.toString(16).padStart(6, '0')}">${h.icon}</div>
          <strong>${h.name}</strong>
          <div style="font-size:11px;color:#94a3b8">${h.roleVi}</div>
        `;
        card.addEventListener('click', () => {
          this.selectedHeroId = h.id;
          this.renderHeroesModal();
        });
        grid.appendChild(card);
      });

      const h = HEROES.find((x) => x.id === this.selectedHeroId) || HEROES[0];
      const isOwned = this.saveData.ownedHeroes.includes(h.id);
      const ownedSkinList = (this.saveData.ownedSkins && this.saveData.ownedSkins[h.id]) || ['default'];
      const currentSkin = this.getEquippedSkin(h.id);

      let skinsHtml = h.skins
        .map((sk) => {
          const hasSkin = ownedSkinList.includes(sk.id);
          const active = currentSkin === sk.id;
          return `<button class="tab-btn ${active ? 'active' : ''}" data-equipskin="${sk.id}">
            ${sk.name} ${hasSkin ? (active ? '(Đang dùng)' : '(Đã có)') : `(${sk.priceDiamond} 💎)`}
          </button>`;
        })
        .join(' ');

      detail.innerHTML = `
        <h3 style="color:#fbbf24;font-size:22px">${h.icon} ${h.name} — ${h.title}</h3>
        <p style="font-size:13px;color:#38bdf8;margin:4px 0 10px">Hệ: <strong>${h.roleVi}</strong> | Tầm đánh: ${h.baseStats.atkRange}m | Tốc chạy: ${h.baseStats.moveSpeed}</p>
        <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px">
          Máu: <b>${h.baseStats.hp}</b> | Công VL: <b>${h.baseStats.ad}</b> | Giáp VL: <b>${h.baseStats.armor}</b> | Giáp Phép: <b>${h.baseStats.mr}</b>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Chọn Skin 3D:</div>
          <div class="filter-tabs">${skinsHtml}</div>
        </div>
        <div class="skill-box">
          <strong>[Nội tại] ${h.passive.name}:</strong> ${h.passive.desc}
        </div>
        ${h.skills
          .map(
            (s) => `
          <div class="skill-box">
            <strong>[${s.key}] ${s.icon} ${s.name} (Hồi chiêu: ${s.cd}s):</strong> ${s.desc}
          </div>
        `
          )
          .join('')}
        <div style="margin-top:14px">
          ${
            isOwned
              ? `<button class="btn-buy btn-buy-gold" id="btn-set-showcase">Đặt Làm Tướng Giữa Sảnh 3D</button>`
              : `<button class="btn-buy btn-buy-gold" id="btn-goto-shop-hero">Mở Cửa Hàng Để Mua (${h.priceGold.toLocaleString()} 🪙 / ${h.priceDiamond} 💎)</button>`
          }
        </div>
      `;

      detail.querySelectorAll('[data-equipskin]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const skId = btn.getAttribute('data-equipskin');
          if (!ownedSkinList.includes(skId)) {
            this.showToast('Bạn chưa sở hữu Skin này! Hãy mua tại Cửa Hàng.');
            return;
          }
          this.saveData.equippedSkins[h.id] = skId;
          this.saveProfile();
          this.world.setupLobbyScene(h, skId);
          this.renderHeroesModal();
          this.showToast(`Đã trang bị ${skId} cho ${h.name}!`);
        });
      });

      const btnShowcase = document.getElementById('btn-set-showcase');
      if (btnShowcase) {
        btnShowcase.addEventListener('click', () => {
          this.showcaseIndex = HEROES.findIndex((x) => x.id === h.id);
          this.world.setupLobbyScene(h, this.getEquippedSkin(h.id));
          this.refreshLobbyUI();
          this.showToast(`Đã đặt ${h.name} làm nhân vật đại diện Sảnh!`);
        });
      }

      const btnGotoShop = document.getElementById('btn-goto-shop-hero');
      if (btnGotoShop) {
        btnGotoShop.addEventListener('click', () => {
          document.getElementById('modal-heroes').classList.add('hidden');
          this.selectedShopTab = 'heroes';
          this.renderShopModal();
          document.getElementById('modal-shop').classList.remove('hidden');
        });
      }
    }

    // Hiển thị Cửa Hàng (Mua Nhân Vật, Mua Skin, Sự kiện Vòng quay Ruby)
    renderShopModal() {
      const container = document.getElementById('shop-content-container');
      if (this.selectedShopTab === 'heroes') {
        container.innerHTML = `<div class="shop-grid">
          ${HEROES.map((h) => {
            const owned = this.saveData.ownedHeroes.includes(h.id);
            return `
              <div class="shop-card">
                <div>
                  <div style="font-size:26px">${h.icon} <strong>${h.name}</strong></div>
                  <div style="font-size:12px;color:#38bdf8">${h.roleVi} — ${h.title}</div>
                  <p style="font-size:12px;color:#cbd5e1;margin-top:6px">${h.passive.desc}</p>
                </div>
                <div class="shop-btn-row">
                  ${
                    owned
                      ? `<button class="btn-buy" disabled>ĐÃ SỞ HỮU</button>`
                      : `
                        <button class="btn-buy btn-buy-gold" data-buyhero-gold="${h.id}">Mua ${h.priceGold.toLocaleString()} 🪙</button>
                        <button class="btn-buy btn-buy-diamond" data-buyhero-dia="${h.id}">Mua ${h.priceDiamond} 💎</button>
                      `
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>`;

        container.querySelectorAll('[data-buyhero-gold]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const h = HEROES.find((x) => x.id === btn.getAttribute('data-buyhero-gold'));
            if (this.saveData.gold < h.priceGold) return this.showToast('Không đủ Vàng!');
            this.saveData.gold -= h.priceGold;
            this.unlockHero(h.id);
            this.showToast(`Mua thành công nhân vật ${h.name} bằng Vàng!`);
          });
        });

        container.querySelectorAll('[data-buyhero-dia]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const h = HEROES.find((x) => x.id === btn.getAttribute('data-buyhero-dia'));
            if (this.saveData.diamond < h.priceDiamond) return this.showToast('Không đủ Kim Cương!');
            this.saveData.diamond -= h.priceDiamond;
            this.unlockHero(h.id);
            this.showToast(`Mua thành công nhân vật ${h.name} bằng Kim Cương!`);
          });
        });
      } else if (this.selectedShopTab === 'skins') {
        const allSkins = [];
        HEROES.forEach((h) => {
          h.skins.forEach((sk) => {
            if (sk.id !== 'default') allSkins.push({ hero: h, skin: sk });
          });
        });

        container.innerHTML = `<div class="shop-grid">
          ${allSkins
            .map(({ hero, skin }) => {
              const ownedList = this.saveData.ownedSkins[hero.id] || ['default'];
              const hasSkin = ownedList.includes(skin.id);
              return `
                <div class="shop-card">
                  <div>
                    <div class="hero-color-orb" style="background:#${skin.bodyColor.toString(16).padStart(6, '0')}">${hero.icon}</div>
                    <strong>${skin.name}</strong>
                    <div style="font-size:12px;color:#94a3b8">Tướng: ${hero.name} (${hero.roleVi})</div>
                    <div style="font-size:11px;color:#fde68a;margin-top:4px">Đổi màu Giáp 3D, Vũ Khí & Hiệu Ứng Chiêu!</div>
                  </div>
                  <div class="shop-btn-row">
                    ${
                      hasSkin
                        ? `<button class="btn-buy" disabled>ĐÃ SỞ HỮU SKIN</button>`
                        : `<button class="btn-buy btn-buy-diamond" data-buyskin="${hero.id}:${skin.id}">${skin.priceDiamond} 💎</button>`
                    }
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>`;

        container.querySelectorAll('[data-buyskin]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const [hId, skId] = btn.getAttribute('data-buyskin').split(':');
            const hero = HEROES.find((x) => x.id === hId);
            const skin = hero.skins.find((s) => s.id === skId);
            if (this.saveData.diamond < skin.priceDiamond) return this.showToast('Không đủ Kim Cương!');
            this.saveData.diamond -= skin.priceDiamond;
            if (!this.saveData.ownedSkins[hId]) this.saveData.ownedSkins[hId] = ['default'];
            this.saveData.ownedSkins[hId].push(skId);
            this.saveData.equippedSkins[hId] = skId;
            this.saveProfile();
            this.renderShopModal();
            this.showToast(`Đã mở khóa & trang bị ${skin.name}!`);
          });
        });
      } else {
        // Tab Sự kiện Vòng Quay Ruby
        container.innerHTML = `
          <div style="max-width:620px;margin:20px auto;text-align:center;background:#1e293b;padding:26px;border-radius:16px;border:2px solid #f43f5e">
            <div style="font-size:52px">♦️🎡</div>
            <h3 style="font-size:22px;color:#fda4af;margin:8px 0">SỰ KIỆN VÒNG QUAY TINH HỆ RUBY</h3>
            <p style="font-size:14px;color:#cbd5e1;margin-bottom:18px">
              Dùng <strong>50 Ruby ♦️</strong> mỗi lượt để nhận ngẫu nhiên: <strong>1,500 - 4,000 Vàng 🪙</strong>, <strong>120 - 300 Kim Cương 💎</strong>, hoặc <strong>Mở khóa ngẫu nhiên 1 Skin 3D hiếm</strong>!
            </p>
            <button class="btn-buy btn-buy-ruby" id="btn-spin-ruby" style="font-size:16px;padding:14px 32px">
              QUAY THƯỞNG NGAY (50 ♦️ RUBY)
            </button>
            <div id="ruby-spin-result" style="margin-top:16px;font-weight:800;color:#fde68a"></div>
          </div>
        `;

        document.getElementById('btn-spin-ruby').addEventListener('click', () => {
          if (this.saveData.ruby < 50) return this.showToast('Bạn cần tối thiểu 50 Ruby ♦️ để quay!');
          this.saveData.ruby -= 50;
          const roll = Math.random();
          let rewardMsg = '';
          if (roll < 0.5) {
            const g = 1800 + Math.floor(Math.random() * 2200);
            this.saveData.gold += g;
            rewardMsg = `🎉 Chúc mừng! Bạn nhận được +${g.toLocaleString()} Vàng 🪙!`;
          } else if (roll < 0.85) {
            const d = 120 + Math.floor(Math.random() * 180);
            this.saveData.diamond += d;
            rewardMsg = `🎉 Tuyệt vời! Bạn nhận được +${d} Kim Cương 💎!`;
          } else {
            const g = 3500;
            const d = 250;
            this.saveData.gold += g;
            this.saveData.diamond += d;
            rewardMsg = `🌟 NỔ HŨ TINH HỆ! Nhận +${g} Vàng 🪙 và +${d} Kim Cương 💎!`;
          }
          this.saveProfile();
          document.getElementById('ruby-spin-result').textContent = rewardMsg;
        });
      }
    }

    unlockHero(heroId) {
      if (!this.saveData.ownedHeroes.includes(heroId)) {
        this.saveData.ownedHeroes.push(heroId);
      }
      if (!this.saveData.ownedSkins[heroId]) {
        this.saveData.ownedSkins[heroId] = ['default'];
      }
      this.saveProfile();
      this.renderShopModal();
    }

    // Hiển thị Bảng 14 Bậc Rank
    renderRankedModal() {
      const rInfo = getRankByStars(this.saveData.stars);
      const card = document.getElementById('rank-current-card');
      const ladder = document.getElementById('rank-ladder-list');

      card.innerHTML = `
        <div class="rank-emblem-big">${rInfo.tier.icon}</div>
        <h3 style="font-size:24px;color:#fbbf24">${rInfo.tier.name.toUpperCase()}</h3>
        <div style="font-size:14px;color:#93c5fd;margin:4px 0">${rInfo.tier.nameEn} — ${rInfo.starsInTier} Sao (Tổng: ${rInfo.totalStars} ⭐)</div>
        <div style="font-size:13px;color:#cbd5e1;margin:10px 0">
          Độ khó AI hiện tại: <strong style="color:#f87171">${rInfo.tier.aiTierName} (Cấp AI ${rInfo.tier.aiTier})</strong>
        </div>
        <div style="background:#0f172a;padding:10px;border-radius:8px;font-size:12px;margin-bottom:14px">
          <div>Điểm Tinh Túy (Bảo hộ sao): <b style="color:#34d399">${this.saveData.braveryPoints} / 200</b></div>
          ${
            rInfo.tier.hardTier
              ? `<div style="margin-top:4px;color:#fde68a">Tiến trình Điểm Chiến Lực (RP): <b>${this.saveData.rankPoints} / 100 RP</b></div>`
              : `<div style="margin-top:4px;color:#94a3b8">Thắng +1 Sao | Đủ 200 Điểm Tinh Túy chặn 1 lần trừ sao.</div>`
          }
        </div>
        <button class="btn-play-ranked" id="btn-ranked-modal-play" style="width:100%">VÀO ĐẤU XẾP HẠNG 3v3</button>
      `;

      document.getElementById('btn-ranked-modal-play').addEventListener('click', () => {
        document.getElementById('modal-ranked').classList.add('hidden');
        this.openDraftModal();
      });

      ladder.innerHTML = RANKS.map((rk) => {
        const isCurrent = rk.id === rInfo.tier.id;
        return `
          <div class="rank-row-item ${isCurrent ? 'current-tier' : ''}">
            <div>
              <strong style="font-size:15px">${rk.icon} Bậc ${rk.id}: ${rk.name}</strong>
              <span style="font-size:12px;color:#94a3b8;margin-left:8px">(${rk.minStars} -> ${rk.maxStars === 9999 ? '346+' : rk.maxStars} ⭐)</span>
              <div style="font-size:11px;color:${rk.hardTier ? '#f87171' : '#38bdf8'}">
                Bot: ${rk.aiTierName} (x${rk.statMult.toFixed(2)} sức mạnh chiến thuật) ${rk.hardTier ? '• [MỐC KHÓ LEO - Dùng RP]' : ''}
              </div>
            </div>
            <div style="text-align:right;font-size:12px;color:#fde68a">
              Thưởng lên bậc:<br>+${rk.rewardGold.toLocaleString()} 🪙 | +${rk.rewardDia} 💎
            </div>
          </div>
        `;
      }).join('');
    }

    // Màn hình Chọn Tướng 3v3 trước khi vào trận
    openDraftModal() {
      const rInfo = getRankByStars(this.saveData.stars);
      document.getElementById('draft-ai-tier-name').textContent = `${rInfo.tier.name} - ${rInfo.tier.aiTierName}`;

      if (!this.saveData.ownedHeroes.includes(this.selectedHeroId)) {
        this.selectedHeroId = this.saveData.ownedHeroes[0];
      }

      // Tự động xếp 2 đồng đội Bot cân bằng đội hình và 3 Bot Phe Đỏ
      this.draftAllies = this.pickBalancedBots(this.selectedHeroId, 2);
      this.draftEnemies = this.pickBalancedBots(null, 3);

      this.renderDraftUI();
      document.getElementById('modal-draft').classList.remove('hidden');
    }

    pickBalancedBots(excludeHeroId, count) {
      const pool = HEROES.filter((h) => h.id !== excludeHeroId);
      const picked = [];
      const preferredRoles = ['Tank', 'Mage', 'Assassin', 'Fighter'];
      for (let i = 0; i < preferredRoles.length && picked.length < count; i++) {
        const candidate = pool.find((h) => h.role === preferredRoles[i] && !picked.includes(h));
        if (candidate) picked.push(candidate);
      }
      while (picked.length < count) {
        const c = pool[Math.floor(Math.random() * pool.length)];
        if (!picked.includes(c)) picked.push(c);
      }
      return picked;
    }

    renderDraftUI() {
      const playerHero = HEROES.find((h) => h.id === this.selectedHeroId) || HEROES[0];

      const blueSlots = [
        { tag: 'BẠN', hero: playerHero },
        { tag: 'BOT ĐỒNG ĐỘI 1', hero: this.draftAllies[0] },
        { tag: 'BOT ĐỒNG ĐỘI 2', hero: this.draftAllies[1] }
      ];

      document.getElementById('draft-blue-slots').innerHTML = blueSlots
        .map(
          (s) => `
        <div class="draft-slot-card">
          <div style="font-size:10px;color:#60a5fa">${s.tag}</div>
          <div style="font-size:16px;font-weight:800;margin:2px 0">${s.hero.icon} ${s.hero.name}</div>
          <div style="font-size:11px;color:#94a3b8">${s.hero.roleVi}</div>
        </div>
      `
        )
        .join('');

      document.getElementById('draft-red-slots').innerHTML = this.draftEnemies
        .map(
          (h, idx) => `
        <div class="draft-slot-card">
          <div style="font-size:10px;color:#f87171">BOT ĐỊCH ${idx + 1}</div>
          <div style="font-size:16px;font-weight:800;margin:2px 0">${h.icon} ${h.name}</div>
          <div style="font-size:11px;color:#94a3b8">${h.roleVi}</div>
        </div>
      `
        )
        .join('');

      const poolEl = document.getElementById('draft-hero-pool');
      poolEl.innerHTML = '';
      HEROES.filter((h) => this.saveData.ownedHeroes.includes(h.id)).forEach((h) => {
        const card = document.createElement('div');
        card.className = `hero-card ${h.id === this.selectedHeroId ? 'selected' : ''}`;
        card.style.minWidth = '135px';
        card.innerHTML = `
          <div style="font-size:22px">${h.icon}</div>
          <strong>${h.name}</strong>
          <div style="font-size:11px;color:#38bdf8">${h.roleVi}</div>
        `;
        card.addEventListener('click', () => {
          this.selectedHeroId = h.id;
          this.draftAllies = this.pickBalancedBots(this.selectedHeroId, 2);
          this.renderDraftUI();
        });
        poolEl.appendChild(card);
      });

      document.getElementById('draft-skill-preview').innerHTML = `
        <div style="font-size:13px">
          <strong style="color:#fbbf24">${playerHero.name} (${playerHero.roleVi}):</strong>
          Nội tại <em>${playerHero.passive.name}</em> |
          [Q] ${playerHero.skills[0].name} |
          [W] ${playerHero.skills[1].name} |
          [E] ${playerHero.skills[2].name}
        </div>
      `;
    }

    // ==================== 3. KHỞI TẠO TRẬN ĐẤU 3v3 & CÁC ĐƠN VỊ ====================
    start3v3Match(playerHeroId) {
      document.getElementById('lobby-screen').classList.remove('active');
      document.getElementById('match-screen').classList.add('active');
      document.getElementById('respawn-banner').classList.add('hidden');

      this.world.setupMatchArena();
      this.units = [];
      this.projectiles = [];
      this.matchTime = 0;
      this.waveTimer = 1.5;
      this.waveCount = 0;
      this.goldTickTimer = 0;
      this.scoreBlue = 0;
      this.scoreRed = 0;
      this.firstBloodTaken = false;
      this.bossNextSpawn = 120;
      this.bossAlive = false;
      this.moveTarget = null;

      const rInfo = getRankByStars(this.saveData.stars);
      this.currentRankTier = rInfo.tier;

      // 1. Tạo Trụ Ngoài (Tier 1), Trụ Trong (Tier 2) và Nhà Chính (Tier 3 - Nexus) cho 2 phe
      this.spawnStructure('BLUE', 1, -18, 0, 'Trụ Ngoài Xanh');
      this.spawnStructure('BLUE', 2, -32, 0, 'Trụ Trong Xanh');
      this.spawnStructure('BLUE', 3, -44, 0, 'Nhà Chính Xanh');

      this.spawnStructure('RED', 1, 18, 0, 'Trụ Ngoài Đỏ');
      this.spawnStructure('RED', 2, 32, 0, 'Trụ Trong Đỏ');
      this.spawnStructure('RED', 3, 44, 0, 'Nhà Chính Đỏ');

      // 2. Tạo Tướng Người Chơi & 2 Bot Đồng Đội (Phe Xanh)
      const pHero = HEROES.find((h) => h.id === playerHeroId) || HEROES[0];
      this.player = this.spawnHeroUnit(pHero, 'BLUE', -46, 0, true, 1.0);
      this.spawnHeroUnit(this.draftAllies[0], 'BLUE', -46, -2.8, false, 1.0);
      this.spawnHeroUnit(this.draftAllies[1], 'BLUE', -46, 2.8, false, 1.0);

      // 3. Tạo 3 Bot Phe Đỏ với Hệ số thông minh & sức mạnh theo Bậc Rank
      const enemyMult = this.currentRankTier.statMult;
      this.spawnHeroUnit(this.draftEnemies[0], 'RED', 46, 0, false, enemyMult);
      this.spawnHeroUnit(this.draftEnemies[1], 'RED', 46, -2.8, false, enemyMult);
      this.spawnHeroUnit(this.draftEnemies[2], 'RED', 46, 2.8, false, enemyMult);

      // 4. Tạo Quái Rừng ban đầu
      this.spawnJungleCamps();

      this.setupPlayerSkillHUD(pHero);
      this.updateHUD();
      this.matchActive = true;
      this.addFeedBanner(`⚔️ TRẬN ĐẤU 3v3 BẮT ĐẦU — RANK: ${this.currentRankTier.name.toUpperCase()}!`);
    }

    createFloatingBar(name, team, isHero) {
      const wrap = document.createElement('div');
      wrap.className = 'unit-floating-hud';
      const color = team === 'BLUE' ? '#38bdf8' : team === 'RED' ? '#f87171' : '#fbbf24';
      wrap.innerHTML = `
        <div class="unit-floating-name" style="color:${color}">${name}</div>
        <div class="unit-hp-box" style="height:${isHero ? '8px' : '5px'}">
          <div class="unit-hp-inner" style="width:100%;background:${color}"></div>
        </div>
      `;
      this.world.uiLayer.appendChild(wrap);
      return wrap;
    }

    spawnStructure(team, tier, x, z, label) {
      const isNexus = tier === 3;
      const maxHp = isNexus ? 9500 : tier === 2 ? 6200 : 4800;
      const mesh = this.world.createStructureMesh(team, tier);
      mesh.position.set(x, 0, z);
      this.world.arenaGroup.add(mesh);

      const hudEl = this.createFloatingBar(label, team, true);
      this.units.push({
        uid: `struct_${team}_${tier}`,
        kind: 'STRUCTURE',
        tier,
        isNexus,
        name: label,
        team,
        x,
        z,
        radius: isNexus ? 2.2 : 1.4,
        hp: maxHp,
        maxHp,
        ad: isNexus ? 290 : 240,
        ap: 0,
        armor: 180,
        mr: 150,
        atkRange: 9.5,
        atkCd: 0,
        atkInterval: 1.15,
        dead: false,
        invulnerableTimer: 0,
        ccImmuneTimer: 99999,
        stunTimer: 0,
        slowTimer: 0,
        shield: 0,
        mesh,
        hudEl
      });
    }

    spawnHeroUnit(heroData, team, x, z, isPlayer, statMult = 1.0) {
      const skinId = isPlayer ? this.getEquippedSkin(heroData.id) : 'default';
      const mesh = this.world.createHeroMesh(heroData, skinId, team);
      mesh.position.set(x, 0, z);
      mesh.scale.setScalar(heroData.visual.scale || 1.0);
      this.world.arenaGroup.add(mesh);

      const hudEl = this.createFloatingBar(`Lv.1 ${heroData.name}`, team, true);
      const bs = heroData.baseStats;

      const unit = {
        uid: `hero_${team}_${heroData.id}_${Math.random().toString(36).slice(2, 6)}`,
        kind: 'HERO',
        isPlayer,
        heroData,
        name: heroData.name,
        role: heroData.role,
        team,
        x,
        z,
        spawnX: x,
        spawnZ: z,
        radius: 0.85,
        level: 1,
        exp: 0,
        gold: 300,
        kills: 0,
        deaths: 0,
        assists: 0,
        items: [],
        statMult,

        // Chỉ số động
        maxHp: Math.round(bs.hp * statMult),
        hp: Math.round(bs.hp * statMult),
        maxMp: bs.mp,
        mp: bs.mp,
        ad: Math.round(bs.ad * statMult),
        ap: Math.round(bs.ap * statMult),
        armor: Math.round(bs.armor * statMult),
        mr: Math.round(bs.mr * statMult),
        atkRange: bs.atkRange,
        moveSpeed: bs.moveSpeed,
        atkSpeed: 1.0,
        crit: heroData.id === 'zephyr' ? 0.15 : 0.05,
        critDmg: 2.0,
        arPenFlat: 0,
        arPenPct: 0,
        mgPenFlat: 0,
        mgPenPct: 0,
        lifesteal: heroData.id === 'nyx' ? 0.15 : 0,
        spellVamp: 0,
        cdr: 0,
        tenacity: 0,

        // Trạng thái chiến đấu & Nội tại Trang bị
        shield: 0,
        atkCd: 0,
        skillCds: [0, 0, 0],
        recallCd: 0,
        castCount: 0,
        hitCount: 0,
        omniReady: false,
        apocalypseReady: false,
        p08Cooldown: 0, // Hồi chiêu Thiên Kiếm (P08)
        t06Count: 0,    // Số lần Giáp Hộ Mệnh (T06) đã dùng
        t06Cooldown: 0,
        p04Cooldown: 0,
        m04Cooldown: 0,

        // Hiệu ứng khống chế / Bất tử
        stunTimer: 0,
        slowTimer: 0,
        slowFactor: 0,
        invulnerableTimer: 0, // Bất tử 100% ST (Thiên Kiếm P08)
        ccImmuneTimer: 0,     // Miễn nhiễm choáng (Thiên Kiếm P08)
        unyieldingTimer: 0,   // Máu không tụt dưới 1 (Chiêu cuối Ragnar)
        stealthTimer: 0,
        redBuffTimer: 0,
        blueBuffTimer: 0,
        dead: false,
        respawnTimer: 0,
        aiDecisionTimer: 0,

        mesh,
        hudEl
      };

      this.recalcHeroStats(unit);
      unit.hp = unit.maxHp;
      unit.mp = unit.maxMp;
      this.units.push(unit);
      return unit;
    }

    spawnMinionWave() {
      this.waveCount++;
      const types = ['MELEE', 'MELEE', 'RANGED'];
      if (this.waveCount % 3 === 0) types.push('SIEGE');

      ['BLUE', 'RED'].forEach((team) => {
        const dir = team === 'BLUE' ? 1 : -1;
        const startX = team === 'BLUE' ? -40 : 40;
        types.forEach((mType, idx) => {
          const isSiege = mType === 'SIEGE';
          const isRanged = mType === 'RANGED';
          const maxHp = isSiege ? 1350 + this.waveCount * 45 : isRanged ? 580 + this.waveCount * 22 : 850 + this.waveCount * 30;
          const ad = isSiege ? 125 + this.waveCount * 6 : isRanged ? 75 + this.waveCount * 4 : 60 + this.waveCount * 3;
          const x = startX - dir * (idx * 2.1);
          const z = (idx % 2 === 0 ? 1 : -1) * 0.9;

          const mesh = this.world.createMobMesh('MINION', team);
          mesh.position.set(x, 0, z);
          if (isSiege) mesh.scale.setScalar(1.35);
          this.world.arenaGroup.add(mesh);

          const hudEl = this.createFloatingBar(isSiege ? 'Xe Công Thành' : 'Lính', team, false);
          this.units.push({
            uid: `minion_${team}_${this.waveCount}_${idx}`,
            kind: 'MINION',
            minionType: mType,
            name: isSiege ? 'Xe Công Thành' : 'Lính',
            team,
            x,
            z,
            radius: 0.55,
            hp: maxHp,
            maxHp,
            ad,
            ap: 0,
            armor: 35,
            mr: 25,
            atkRange: isRanged || isSiege ? 6.2 : 2.1,
            moveSpeed: 310,
            atkCd: 0,
            atkInterval: 1.2,
            goldReward: isSiege ? 85 : isRanged ? 35 : 45,
            expReward: isSiege ? 110 : isRanged ? 50 : 60,
            shield: 0,
            stunTimer: 0,
            slowTimer: 0,
            invulnerableTimer: 0,
            ccImmuneTimer: 0,
            dead: false,
            mesh,
            hudEl
          });
        });
      });
    }

    spawnJungleCamps() {
      const camps = [
        { id: 'red_buff', name: 'Golem Bùa Đỏ', x: -20, z: 12, hp: 2600, ad: 135, gold: 90, exp: 120, buff: 'RED' },
        { id: 'blue_buff', name: 'Hộ Vệ Bùa Xanh', x: 20, z: 12, hp: 2600, ad: 135, gold: 90, exp: 120, buff: 'BLUE' },
        { id: 'wolf_left', name: 'Sói Hư Không', x: -22, z: -13, hp: 1650, ad: 95, gold: 60, exp: 80, buff: 'HEAL' },
        { id: 'wolf_right', name: 'Sói Hư Không', x: 22, z: -13, hp: 1650, ad: 95, gold: 60, exp: 80, buff: 'HEAL' }
      ];

      camps.forEach((c) => {
        const exists = this.units.some((u) => !u.dead && u.campId === c.id);
        if (exists) return;
        const mesh = this.world.createMobMesh('JUNGLE', 'NEUTRAL');
        mesh.position.set(c.x, 0, c.z);
        this.world.arenaGroup.add(mesh);

        const hudEl = this.createFloatingBar(c.name, 'NEUTRAL', false);
        this.units.push({
          uid: `jg_${c.id}_${Math.random()}`,
          campId: c.id,
          kind: 'JUNGLE',
          name: c.name,
          team: 'NEUTRAL',
          x: c.x,
          z: c.z,
          homeX: c.x,
          homeZ: c.z,
          radius: 0.9,
          hp: c.hp,
          maxHp: c.hp,
          ad: c.ad,
          ap: 0,
          armor: 60,
          mr: 50,
          atkRange: 2.5,
          moveSpeed: 300,
          atkCd: 0,
          atkInterval: 1.3,
          goldReward: c.gold,
          expReward: c.exp,
          buffType: c.buff,
          shield: 0,
          stunTimer: 0,
          slowTimer: 0,
          invulnerableTimer: 0,
          ccImmuneTimer: 0,
          dead: false,
          mesh,
          hudEl
        });
      });
    }

    spawnAstralBoss() {
      if (this.bossAlive) return;
      this.bossAlive = true;
      const mesh = this.world.createMobMesh('BOSS', 'NEUTRAL');
      mesh.position.set(0, 0, -14);
      this.world.arenaGroup.add(mesh);

      const hudEl = this.createFloatingBar('👾 BOSS: ASTRAL OVERLORD', 'NEUTRAL', true);
      this.units.push({
        uid: 'boss_astral_overlord',
        kind: 'BOSS',
        name: 'Astral Overlord',
        team: 'NEUTRAL',
        x: 0,
        z: -14,
        homeX: 0,
        homeZ: -14,
        radius: 1.8,
        hp: 9200,
        maxHp: 9200,
        ad: 245,
        ap: 0,
        armor: 140,
        mr: 140,
        atkRange: 3.8,
        moveSpeed: 280,
        atkCd: 0,
        atkInterval: 1.25,
        goldReward: 200,
        expReward: 250,
        shield: 0,
        stunTimer: 0,
        slowTimer: 0,
        invulnerableTimer: 0,
        ccImmuneTimer: 99999,
        dead: false,
        mesh,
        hudEl
      });
      this.addFeedBanner('🐉 BOSS CỔ ĐẠI ASTRAL OVERLORD ĐÃ XUẤT HIỆN TẠI HANG BẮC!');
    }

    // ==================== 4. TÍNH TOÁN CHỈ SỐ & TRANG BỊ TRONG TRẬN ====================
    recalcHeroStats(unit) {
      if (unit.kind !== 'HERO') return;
      const bs = unit.heroData.baseStats;
      const lvl = unit.level - 1;
      const mult = unit.statMult || 1.0;

      const hpRatio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 1;

      let hp = (bs.hp + lvl * 235) * mult;
      let mp = bs.mp + lvl * 42;
      let ad = (bs.ad + lvl * 14) * mult;
      let ap = (bs.ap + lvl * 10) * mult;
      let armor = (bs.armor + lvl * 13) * mult;
      let mr = (bs.mr + lvl * 10) * mult;
      let moveSpeed = bs.moveSpeed;
      let atkSpeed = 1.0 + lvl * 0.025;
      let crit = unit.heroData.id === 'zephyr' ? 0.15 : 0.05;
      let critDmg = 2.0;
      let arPenFlat = 0;
      let arPenPct = 0;
      let mgPenFlat = 0;
      let mgPenPct = 0;
      let lifesteal = unit.heroData.id === 'nyx' ? 0.15 : 0;
      let spellVamp = 0;
      let cdr = 0;
      let tenacity = 0;
      let apPercentBonus = 0;

      unit.items.forEach((itemId) => {
        const it = ITEMS.find((x) => x.id === itemId);
        if (!it) return;
        const st = it.stats;
        if (st.hp) hp += st.hp;
        if (st.mp) mp += st.mp;
        if (st.ad) ad += st.ad;
        if (st.ap) ap += st.ap;
        if (st.armor) armor += st.armor;
        if (st.mr) mr += st.mr;
        if (st.moveSpeed) moveSpeed += st.moveSpeed;
        if (st.atkSpeed) atkSpeed += st.atkSpeed;
        if (st.crit) crit += st.crit;
        if (st.critDmgBonus) critDmg = 2.25;
        if (st.arPenFlat) arPenFlat += st.arPenFlat + unit.level * 10;
        if (st.arPenPct) arPenPct = Math.max(arPenPct, st.arPenPct);
        if (st.mgPenFlat) mgPenFlat += st.mgPenFlat;
        if (st.mgPenPct) mgPenPct = Math.max(mgPenPct, st.mgPenPct);
        if (st.lifesteal) lifesteal += st.lifesteal;
        if (st.spellVamp) spellVamp += st.spellVamp;
        if (st.cdr) cdr += st.cdr;
        if (st.tenacity) tenacity = Math.max(tenacity, st.tenacity);
        if (st.apPercentBonus) apPercentBonus += st.apPercentBonus;
      });

      if (unit.heroData.id === 'thalor') armor *= 1.2;
      if (apPercentBonus > 0) ap *= 1 + apPercentBonus;
      if (unit.blueBuffTimer > 0) cdr += 0.2;

      unit.maxHp = Math.round(hp);
      unit.hp = Math.min(unit.maxHp, Math.max(1, Math.round(unit.maxHp * hpRatio)));
      unit.maxMp = Math.round(mp);
      unit.ad = Math.round(ad);
      unit.ap = Math.round(ap);
      unit.armor = Math.round(armor);
      unit.mr = Math.round(mr);
      unit.moveSpeed = Math.round(moveSpeed);
      unit.atkSpeed = Math.min(2.5, atkSpeed);
      unit.crit = Math.min(1.0, crit);
      unit.critDmg = critDmg;
      unit.arPenFlat = arPenFlat;
      unit.arPenPct = arPenPct;
      unit.mgPenFlat = mgPenFlat;
      unit.mgPenPct = mgPenPct;
      unit.lifesteal = lifesteal;
      unit.spellVamp = spellVamp;
      unit.cdr = Math.min(0.4, cdr);
      unit.tenacity = tenacity;
    }

    buyItemForUnit(unit, itemId) {
      if (unit.items.length >= 6) {
        if (unit.isPlayer) this.showToast('Đã đầy 6 ô trang bị!');
        return false;
      }
      const item = ITEMS.find((x) => x.id === itemId);
      if (!item || unit.gold < item.cost) return false;

      // Tối đa 1 Giày
      if (item.category === 'Boots' && unit.items.some((id) => id.startsWith('B'))) {
        if (unit.isPlayer) this.showToast('Mỗi nhân vật chỉ mang tối đa 1 Giày!');
        return false;
      }
      // Không mua trùng trang bị có Nội tại duy nhất P08
      if (itemId === 'P08' && unit.items.includes('P08')) {
        if (unit.isPlayer) this.showToast('Thiên Kiếm là trang bị Nội tại duy nhất, đã sở hữu!');
        return false;
      }

      unit.gold -= item.cost;
      unit.items.push(itemId);
      this.recalcHeroStats(unit);
      if (unit.isPlayer) {
        this.showToast(`Đã trang bị: ${item.nameVi} (${item.nameEn})`);
        this.updateHUD();
        this.renderIngameShopModal();
      }
      return true;
    }

    // ==================== 5. HỆ THỐNG CHIẾN ĐẤU, KỸ NĂNG & NỘI TẠI P08 THIÊN KIẾM ====================
    canAttackStructure(attacker, structUnit) {
      if (structUnit.kind !== 'STRUCTURE') return true;
      // Kiểm tra thứ tự phá trụ: Tier 1 -> Tier 2 -> Tier 3 (Nexus)
      if (structUnit.tier === 2) {
        const tier1Alive = this.units.some((u) => !u.dead && u.kind === 'STRUCTURE' && u.team === structUnit.team && u.tier === 1);
        if (tier1Alive) return false;
      } else if (structUnit.tier === 3) {
        const tier2Alive = this.units.some((u) => !u.dead && u.kind === 'STRUCTURE' && u.team === structUnit.team && u.tier === 2);
        if (tier2Alive) return false;
      }
      return true;
    }

    applyCC(target, stunDuration, slowFactor, slowDuration) {
      if (target.dead) return;
      // Kiểm tra Miễn nhiễm choáng từ Thiên Kiếm (P08) hoặc Trụ/Boss
      if (target.ccImmuneTimer > 0) {
        if (stunDuration > 0 && target.isPlayer) {
          this.world.spawnFloatingText(target.x, 2.8, target.z, 'MIỄN CHOÁNG!', '#fef08a');
        }
        return;
      }
      const mult = 1 - (target.tenacity || 0);
      if (stunDuration > 0) {
        target.stunTimer = Math.max(target.stunTimer, stunDuration * mult);
        this.world.spawnFloatingText(target.x, 2.6, target.z, 'CHOÁNG!', '#facc15');
      }
      if (slowFactor > 0) {
        target.slowFactor = Math.max(target.slowFactor || 0, slowFactor);
        target.slowTimer = Math.max(target.slowTimer, (slowDuration || 2.0) * mult);
      }
    }

    dealDamage(attacker, target, rawAmount, dmgType = 'PHYSICAL', isBasicAttack = false) {
      if (!target || target.dead || rawAmount <= 0) return;
      if (target.kind === 'STRUCTURE' && !this.canAttackStructure(attacker, target)) return;

      // 1. Kiểm tra trạng thái BẤT TỬ (Từ Thiên Kiếm P08)
      if (target.invulnerableTimer > 0) {
        this.world.spawnFloatingText(target.x, 2.5, target.z, 'BẤT TỬ (P08)', '#fef08a');
        return;
      }

      let dmg = rawAmount;

      // Nội tại Permafrost của Glacia (+25% ST lên mục tiêu đang bị làm chậm/choáng)
      if (attacker && attacker.heroData && attacker.heroData.id === 'glacia' && (target.slowTimer > 0 || target.stunTimer > 0)) {
        dmg *= 1.25;
      }

      // Nội tại P07 (Nanh Fenrir): +30% ST khi mục tiêu dưới 50% máu
      if (attacker && attacker.items && attacker.items.includes('P07') && target.hp / target.maxHp < 0.5) {
        dmg *= 1.3;
      }

      // Tính Chí mạng cho đòn đánh vật lý
      let isCrit = false;
      if (dmgType === 'PHYSICAL' && attacker && attacker.kind === 'HERO') {
        const forceCrit = attacker.heroData.id === 'kaelen' && target.hp / target.maxHp < 0.45;
        if (forceCrit || (isBasicAttack && Math.random() < attacker.crit)) {
          isCrit = true;
          dmg *= attacker.critDmg || 2.0;
        }
      }

      // Giảm sát thương theo Giáp VL / Giáp Phép
      if (dmgType === 'PHYSICAL') {
        const penPct = (attacker && attacker.arPenPct) || 0;
        const penFlat = (attacker && attacker.arPenFlat) || 0;
        const effArmor = Math.max(0, target.armor * (1 - penPct) - penFlat);
        dmg *= 600 / (600 + effArmor);
        if (isBasicAttack && target.items && target.items.includes('B01')) dmg *= 0.85;
      } else if (dmgType === 'MAGIC') {
        const penPct = (attacker && attacker.mgPenPct) || 0;
        const penFlat = (attacker && attacker.mgPenFlat) || 0;
        const effMr = Math.max(0, target.mr * (1 - penPct) - penFlat);
        dmg *= 600 / (600 + effMr);
      }

      // Cơ chế Bảo vệ Trụ khi không có lính đồng minh
      if (target.kind === 'STRUCTURE') {
        const hasEnemyMinionNear = this.units.some(
          (u) => !u.dead && u.kind === 'MINION' && u.team !== target.team && this.dist(u, target) <= 9.5
        );
        if (!hasEnemyMinionNear) dmg *= 0.3;
      }

      // Nội tại Vanguard giảm 12% ST
      if (target.heroData && target.heroData.id === 'vanguard') dmg *= 0.88;

      dmg = Math.max(1, Math.round(dmg));

      // Hấp thụ qua Khiên chắn trước
      if (target.shield > 0) {
        if (target.shield >= dmg) {
          target.shield -= dmg;
          dmg = 0;
        } else {
          dmg -= target.shield;
          target.shield = 0;
        }
      }

      if (dmg <= 0) return;

      // ==================== KIỂM TRA ĐÒN SÁT THƯƠNG CHÍ TỬ (LETHAL DAMAGE CHECK) ====================
      if (target.hp - dmg <= 0 && target.kind === 'HERO') {
        // Ưu tiên 1: Chiêu cuối Ragnar (Berserker's Immortality)
        if (target.unyieldingTimer > 0) {
          target.hp = 1;
          this.world.spawnFloatingText(target.x, 2.7, target.z, 'BẤT KHUẤT!', '#ef4444');
          return;
        }

        // Ưu tiên 2: TRANG BỊ P08 - CELESTIAL SWORD (THIÊN KIẾM)
        // "Nội tại duy nhất: Khi nhận đòn ST chí tử, bản thân nhận bất tử kèm miễn nhiễm choáng trong 2s."
        if (target.items && target.items.includes('P08') && target.p08Cooldown <= 0) {
          target.p08Cooldown = 90; // Hồi chiêu nội tại 90s
          target.hp = Math.max(1, target.hp); // Chặn hoàn toàn đòn chí tử
          target.invulnerableTimer = 2.0;     // Bất tử 2 giây
          target.ccImmuneTimer = 2.0;         // Miễn nhiễm choáng 2 giây
          target.stunTimer = 0;               // Giải ngay choáng hiện có
          target.slowTimer = 0;
          this.world.spawnVFX('celestial_p08', target.x, target.z, 0xfef08a, 2.2, 2.0);
          this.world.spawnFloatingText(target.x, 3.0, target.z, '⚡ THIÊN KIẾM: BẤT TỬ & MIỄN CHOÁNG 2S!', '#fef08a');
          if (target.isPlayer) {
            this.addFeedBanner('⚔️ THIÊN KIẾM (P08) KÍCH HOẠT: Bất Tử & Miễn Nhiễm Choáng trong 2 giây!');
          }
          return;
        }

        // Ưu tiên 3: Trang bị T06 (Giáp Hộ Mệnh - Blade of Eternity)
        if (target.items && target.items.includes('T06') && target.t06Count < 2 && target.t06Cooldown <= 0) {
          target.t06Count++;
          target.t06Cooldown = 150;
          target.hp = Math.min(target.maxHp, 2500);
          target.stunTimer = 0;
          this.world.spawnVFX('aoe', target.x, target.z, 0xfbbf24, 2.8, 0.8);
          this.world.spawnFloatingText(target.x, 2.9, target.z, 'PHỤC SINH (T06)!', '#fde68a');
          return;
        }
      }

      // Trừ máu thực tế
      target.hp -= dmg;

      // Kích hoạt Khiên máu thấp từ P04 (Kiếm Huyết Tinh) hoặc M04 (Quyền Trượng Rhea)
      if (target.kind === 'HERO' && target.hp > 0) {
        if (target.items.includes('P04') && target.hp / target.maxHp < 0.3 && target.p04Cooldown <= 0) {
          target.p04Cooldown = 60;
          target.shield += 450 + target.level * 50;
          this.world.spawnFloatingText(target.x, 2.5, target.z, '+HUYẾT KHIÊN', '#f87171');
        }
        if (target.items.includes('M04') && target.hp / target.maxHp < 0.4 && target.m04Cooldown <= 0) {
          target.m04Cooldown = 60;
          target.shield += Math.round(500 + target.ap * 0.8);
          this.world.spawnFloatingText(target.x, 2.5, target.z, '+KHIÊN RHEA', '#60a5fa');
        }
      }

      // Hiển thị số sát thương nổi
      const dmgColor = dmgType === 'TRUE' ? '#ffffff' : dmgType === 'MAGIC' ? '#c084fc' : isCrit ? '#fbbf24' : '#f87171';
      this.world.spawnFloatingText(target.x, 2.1, target.z, `${isCrit ? '💥' : ''}${dmg}`, dmgColor);

      // Hút máu VL / Hút máu Phép cho người tấn công
      if (attacker && attacker.kind === 'HERO' && !attacker.dead && target.kind !== 'STRUCTURE') {
        let healAmt = 0;
        if (dmgType === 'PHYSICAL' && attacker.lifesteal > 0) healAmt = dmg * attacker.lifesteal;
        if (dmgType === 'MAGIC' && attacker.spellVamp > 0) healAmt = dmg * attacker.spellVamp;
        if (isBasicAttack && attacker.items.includes('B04')) healAmt += 15;
        if (healAmt >= 1) {
          attacker.hp = Math.min(attacker.maxHp, Math.round(attacker.hp + healAmt));
        }
      }

      // Kiểm tra Hạ gục
      if (target.hp <= 0) {
        this.handleUnitDeath(attacker, target);
      }
    }

    handleUnitDeath(killer, victim) {
      victim.hp = 0;
      victim.dead = true;
      victim.mesh.visible = false;
      victim.hudEl.style.display = 'none';

      // 1. Nếu Phá hủy Nhà Chính -> Kết thúc trận đấu!
      if (victim.kind === 'STRUCTURE' && victim.isNexus) {
        const playerWon = victim.team === 'RED';
        this.endMatch(playerWon, false);
        return;
      }

      // 2. Nếu Phá hủy Trụ Ngoài / Trụ Trong
      if (victim.kind === 'STRUCTURE') {
        const reward = victim.tier === 2 ? 250 : 150;
        this.units.forEach((u) => {
          if (u.kind === 'HERO' && u.team !== victim.team) u.gold += reward;
        });
        this.addFeedBanner(`💥 ${victim.name} đã bị phá hủy! Toàn đội nhận +${reward} Vàng!`);
        return;
      }

      // 3. Nếu Hạ gục Boss Astral Overlord
      if (victim.kind === 'BOSS') {
        this.bossAlive = false;
        this.bossNextSpawn = this.matchTime + 120;
        const killerTeam = killer ? killer.team : 'BLUE';
        this.units.forEach((u) => {
          if (u.kind === 'HERO' && u.team === killerTeam) {
            u.gold += 200;
            this.grantExp(u, 250);
            u.redBuffTimer = 45;
            u.blueBuffTimer = 45;
            this.recalcHeroStats(u);
          }
        });
        this.addFeedBanner(`👑 PHE ${killerTeam === 'BLUE' ? 'XANH' : 'ĐỎ'} HẠ GỤC ASTRAL OVERLORD (+200 Vàng & Bùa Tinh Tú)!`);
        return;
      }

      // 4. Nếu Hạ gục Quái Rừng hoặc Lính
      if (victim.kind === 'JUNGLE' || victim.kind === 'MINION') {
        if (killer && killer.kind === 'HERO') {
          killer.gold += victim.goldReward;
          this.grantExp(killer, victim.expReward);
          if (victim.buffType === 'RED') killer.redBuffTimer = 45;
          if (victim.buffType === 'BLUE') {
            killer.blueBuffTimer = 45;
            this.recalcHeroStats(killer);
          }
          if (victim.buffType === 'HEAL') {
            killer.hp = Math.min(killer.maxHp, Math.round(killer.hp + killer.maxHp * 0.1));
          }
        }
        // Chia EXP & 60% Vàng cho tướng đứng gần
        this.units.forEach((u) => {
          if (u.kind === 'HERO' && !u.dead && u !== killer && u.team !== victim.team && this.dist(u, victim) <= 12) {
            u.gold += Math.round(victim.goldReward * 0.6);
            this.grantExp(u, victim.expReward);
          }
        });
        return;
      }

      // 5. Nếu Hạ gục Tướng (HERO)
      if (victim.kind === 'HERO') {
        victim.deaths++;
        victim.respawnTimer = 5 + victim.level * 1.2;
        if (victim.isPlayer) {
          document.getElementById('respawn-banner').classList.remove('hidden');
        }

        if (victim.team === 'RED') this.scoreBlue++;
        else this.scoreRed++;

        if (killer && killer.kind === 'HERO') {
          killer.kills++;
          let bounty = 200;
          if (!this.firstBloodTaken) {
            this.firstBloodTaken = true;
            bounty = 300;
            this.addFeedBanner(`🩸 CHIẾN CÔNG ĐẦU: ${killer.name} hạ gục ${victim.name} (+300 Vàng)!`);
          } else {
            this.addFeedBanner(`⚔️ ${killer.name} đã hạ gục ${victim.name}!`);
          }
          killer.gold += bounty;
          this.grantExp(killer, 180);

          // Nội tại Kaelen giảm 50% hồi chiêu khi hạ gục
          if (killer.heroData.id === 'kaelen') {
            killer.skillCds = killer.skillCds.map((cd) => cd * 0.5);
          }
          // Nội tại Nyx hồi ngay chiêu Q
          if (killer.heroData.id === 'nyx') {
            killer.skillCds[0] = 0;
          }
        }

        // Hỗ trợ (Assist) cho đồng đội xung quanh
        this.units.forEach((u) => {
          if (u.kind === 'HERO' && u !== killer && u.team !== victim.team && this.dist(u, victim) <= 15) {
            u.assists++;
            u.gold += 100;
            this.grantExp(u, 110);
          }
        });
      }
    }

    grantExp(heroUnit, amount) {
      if (heroUnit.kind !== 'HERO' || heroUnit.level >= 15) return;
      heroUnit.exp += amount;
      const needed = 180 + heroUnit.level * 95;
      if (heroUnit.exp >= needed) {
        heroUnit.exp -= needed;
        heroUnit.level++;
        this.recalcHeroStats(heroUnit);
        heroUnit.hp = Math.min(heroUnit.maxHp, heroUnit.hp + 260);
        heroUnit.mp = Math.min(heroUnit.maxMp, heroUnit.mp + 120);
        this.world.spawnFloatingText(heroUnit.x, 2.8, heroUnit.z, `LÊN CẤP ${heroUnit.level}!`, '#38bdf8');
      }
    }

    // Thực thi Đòn đánh thường
    performBasicAttack(unit, target) {
      if (unit.dead || !target || target.dead) return;
      unit.atkCd = 1.0 / (unit.atkSpeed || 1.0);
      unit.stealthTimer = 0; // Đánh thường làm lộ diện tàng hình

      // Xoay mặt về mục tiêu
      unit.mesh.lookAt(target.x, unit.mesh.position.y, target.z);

      if (unit.atkRange > 4.2) {
        // Đánh xa: bắn đạn năng lượng 3D
        const color = unit.team === 'BLUE' ? 0x38bdf8 : 0xf87171;
        this.spawnProjectile(unit, target, unit.ad, 'PHYSICAL', color, true);
      } else {
        // Cận chiến: gây sát thương trực tiếp
        this.dealDamage(unit, target, unit.ad, 'PHYSICAL', true);
        this.triggerOnHitPassives(unit, target);
      }
    }

    triggerOnHitPassives(unit, target) {
      if (unit.kind !== 'HERO' || target.dead) return;
      // Nội tại P03 (Omni Arms - Phức Hợp Kiếm)
      if (unit.omniReady && unit.items.includes('P03')) {
        unit.omniReady = false;
        this.dealDamage(unit, target, unit.ad, 'PHYSICAL', false);
      }
      // Nội tại M06 (Apocalypse - Thập Tự Kiếm)
      if (unit.apocalypseReady && unit.items.includes('M06')) {
        unit.apocalypseReady = false;
        this.dealDamage(unit, target, Math.round(100 + unit.ap * 0.7), 'MAGIC', false);
      }
      // Bùa Đỏ gây làm chậm và sát thương chuẩn
      if (unit.redBuffTimer > 0 && target.kind !== 'STRUCTURE') {
        this.dealDamage(unit, target, 55, 'TRUE', false);
        this.applyCC(target, 0, 0.2, 1.5);
      }
      // Nội tại Long Huyết Valerius hồi máu
      if (unit.heroData.id === 'valerius') {
        unit.hp = Math.min(unit.maxHp, Math.round(unit.hp + unit.maxHp * 0.02));
      }
    }

    // Thực thi 3 Kỹ năng (Q, W, E) của từng Nhân vật
    castSkill(unit, skillIdx) {
      if (unit.dead || unit.stunTimer > 0) return false;
      if (skillIdx === 2 && unit.level < 4) {
        if (unit.isPlayer) this.showToast('Chiêu cuối [E] mở khóa ở Cấp 4!');
        return false;
      }
      if (unit.skillCds[skillIdx] > 0) return false;

      const sk = unit.heroData.skills[skillIdx];
      if (!sk || unit.mp < sk.mpCost) {
        if (unit.isPlayer && sk && unit.mp < sk.mpCost) this.showToast('Không đủ Năng lượng (Mana)!');
        return false;
      }

      unit.mp -= sk.mpCost;
      unit.skillCds[skillIdx] = sk.cd * (1 - (unit.cdr || 0));
      unit.castCount++;
      unit.omniReady = true;
      unit.apocalypseReady = true;

      // Tìm mục tiêu ưu tiên gần nhất trong tầm
      const target = this.findBestTarget(unit, 10.5);
      const tx = target ? target.x : unit.x + (unit.team === 'BLUE' ? 4 : -4);
      const tz = target ? target.z : unit.z;

      unit.mesh.lookAt(tx, unit.mesh.position.y, tz);

      const skinObj = unit.heroData.skins.find((s) => s.id === (unit.isPlayer ? this.getEquippedSkin(unit.heroData.id) : 'default'));
      const vfxColor = skinObj ? skinObj.vfxColor : unit.heroData.visual.vfxColor;

      const rawSkillDmg = sk.dmgBase + unit.ap * sk.apRatio + unit.ad * sk.adRatio + unit.level * 22;
      const dmgType = sk.type === 'true_burst' ? 'TRUE' : sk.apRatio > sk.adRatio ? 'MAGIC' : 'PHYSICAL';

      // Nội tại Vanguard nhận lá chắn khi tung chiêu
      if (unit.heroData.id === 'vanguard') {
        unit.shield += Math.round(unit.maxHp * 0.08);
      }

      // Xử lý theo từng loại chiêu thức
      if (sk.type === 'dash') {
        const dx = tx - unit.x;
        const dz = tz - unit.z;
        const d = Math.hypot(dx, dz) || 1;
        const step = Math.min(d, 5.5);
        unit.x = Math.max(-50, Math.min(50, unit.x + (dx / d) * step));
        unit.z = Math.max(-18, Math.min(18, unit.z + (dz / d) * step));
        this.world.spawnVFX('aoe', unit.x, unit.z, vfxColor, 3.2, 0.45);
        this.hitEnemiesInRadius(unit, unit.x, unit.z, 3.4, rawSkillDmg, dmgType, sk);
      } else if (sk.type === 'stealth') {
        unit.stealthTimer = sk.stealth || 2.5;
        this.world.spawnVFX('aoe', unit.x, unit.z, vfxColor, 2.5, 0.5);
        if (target && this.dist(unit, target) <= 5) {
          this.dealDamage(unit, target, rawSkillDmg, dmgType, false);
        }
      } else if (sk.type === 'immortal_ult') {
        unit.unyieldingTimer = sk.unyielding || 3.5;
        this.world.spawnVFX('storm', unit.x, unit.z, 0xef4444, 3.8, 1.2);
        this.world.spawnFloatingText(unit.x, 2.8, unit.z, 'CHIẾN THẦN BẤT TỬ 3.5S!', '#ef4444');
        this.hitEnemiesInRadius(unit, unit.x, unit.z, 3.8, rawSkillDmg, dmgType, sk);
      } else if (sk.type === 'shield_aoe' || sk.type === 'heal_aoe') {
        if (sk.shield) unit.shield += sk.shield;
        if (sk.heal) {
          this.units.forEach((ally) => {
            if (!ally.dead && ally.kind === 'HERO' && ally.team === unit.team && this.dist(unit, ally) <= 7) {
              ally.hp = Math.min(ally.maxHp, ally.hp + sk.heal);
              this.world.spawnFloatingText(ally.x, 2.3, ally.z, `+${sk.heal}`, '#4ade80');
            }
          });
        }
        this.world.spawnVFX('shield_aoe', unit.x, unit.z, vfxColor, 4.0, 0.65);
        this.hitEnemiesInRadius(unit, unit.x, unit.z, 4.0, rawSkillDmg, dmgType, sk);
      } else if (sk.type === 'meteor' || sk.type === 'storm' || sk.type === 'aoe') {
        this.world.spawnVFX(sk.type, tx, tz, vfxColor, 4.2, 0.75);
        this.hitEnemiesInRadius(unit, tx, tz, 4.2, rawSkillDmg, dmgType, sk);
      } else {
        // Projectile / Cone / True Burst
        this.world.spawnVFX('cone', tx, tz, vfxColor, 3.5, 0.45);
        this.hitEnemiesInRadius(unit, tx, tz, 3.6, rawSkillDmg, dmgType, sk);
      }

      if (sk.heal && sk.type !== 'heal_aoe') {
        unit.hp = Math.min(unit.maxHp, unit.hp + sk.heal);
      }

      // Nội tại Aurelia mỗi 3 chiêu nổ tinh vân
      if (unit.heroData.id === 'aurelia' && unit.castCount % 3 === 0 && target) {
        this.dealDamage(unit, target, target.maxHp * 0.08, 'MAGIC', false);
        unit.mp = Math.min(unit.maxMp, unit.mp + unit.maxMp * 0.05);
      }

      return true;
    }

    hitEnemiesInRadius(caster, cx, cz, radius, dmg, dmgType, skillSpec) {
      let triggeredBoomstick = false;
      this.units.forEach((u) => {
        if (u.dead || u.team === caster.team || u.kind === 'STRUCTURE') return;
        const d = Math.hypot(u.x - cx, u.z - cz);
        if (d <= radius + u.radius) {
          let finalRaw = dmg;
          if (skillSpec && skillSpec.type === 'true_burst') {
            finalRaw += (u.maxHp - u.hp) * 0.2;
          }
          this.dealDamage(caster, u, finalRaw, dmgType, false);

          if (skillSpec) {
            this.applyCC(u, skillSpec.stun || 0, skillSpec.slow || 0, 2.0);
          }
          // Nội tại Trượng Băng M03 làm chậm 25%
          if (caster.items && caster.items.includes('M03')) {
            this.applyCC(u, 0, 0.25, 2.0);
          }
          // Nội tại Trượng Bùng Nổ M01
          if (!triggeredBoomstick && caster.items && caster.items.includes('M01')) {
            triggeredBoomstick = true;
            this.dealDamage(caster, u, 120 + caster.ap * 0.4, 'MAGIC', false);
          }
        }
      });
    }

    spawnProjectile(attacker, target, dmg, dmgType, colorHex, isBasic) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 8, 8),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      mesh.position.set(attacker.x, 1.3, attacker.z);
      this.world.arenaGroup.add(mesh);
      this.projectiles.push({
        attacker,
        target,
        dmg,
        dmgType,
        isBasic,
        mesh,
        x: attacker.x,
        z: attacker.z,
        speed: 22
      });
    }

    // ==================== 6. TRÍ TUỆ NHÂN TẠO BOT (AI 4 CẤP ĐỘ THEO RANK) ====================
    updateAIUnit(u, dt) {
      if (u.dead || u.stunTimer > 0) return;

      // Tự động mua trang bị chuẩn theo Hệ khi đủ Vàng
      if (u.kind === 'HERO' && !u.isPlayer && u.gold >= 720 && u.items.length < 6) {
        this.autoBuyBotItem(u);
      }

      const aiTier = this.currentRankTier ? this.currentRankTier.aiTier : 1;
      const lowHpThreshold = aiTier >= 3 ? 0.28 : 0.18;

      // Rút lui về Tế đàn hồi máu khi máu nguy kịch
      if (u.kind === 'HERO' && u.hp / u.maxHp < lowHpThreshold && u.unyieldingTimer <= 0 && u.invulnerableTimer <= 0) {
        this.moveTowards(u, u.spawnX, u.spawnZ, dt);
        if (this.distCoords(u.x, u.z, u.spawnX, u.spawnZ) < 4.5) {
          u.hp = Math.min(u.maxHp, u.hp + 450 * dt);
          u.mp = Math.min(u.maxMp, u.mp + 200 * dt);
        }
        return;
      }

      // Ở AI Cấp 3 & 4 (Từ Sử Thi -> Thách Thần Chí Tôn): Biết tập trung ăn Boss khi Boss xuất hiện và đường đang thắng thế
      if (u.kind === 'HERO' && aiTier >= 3 && this.bossAlive) {
        const boss = this.units.find((b) => !b.dead && b.kind === 'BOSS');
        if (boss && u.hp / u.maxHp > 0.65 && Math.abs(u.x) < 16) {
          const dBoss = this.dist(u, boss);
          if (dBoss > u.atkRange * 0.9) {
            this.moveTowards(u, boss.x, boss.z, dt);
          } else if (u.atkCd <= 0) {
            this.performBasicAttack(u, boss);
          }
          return;
        }
      }

      const target = this.findBestTarget(u, u.kind === 'HERO' ? 14 : 10);
      if (target) {
        const d = this.dist(u, target);
        // Nếu là Tướng Bot: Xả combo kỹ năng thông minh
        if (u.kind === 'HERO' && d <= 8.5 && target.kind !== 'STRUCTURE') {
          if (aiTier >= 2 && u.level >= 4 && u.skillCds[2] <= 0) this.castSkill(u, 2);
          if (u.skillCds[1] <= 0) this.castSkill(u, 1);
          if (u.skillCds[0] <= 0) this.castSkill(u, 0);
        }

        // Di chuyển giữ khoảng cách đánh (Kiting cho Pháp sư ở Rank cao)
        if (d > u.atkRange) {
          this.moveTowards(u, target.x, target.z, dt);
        } else {
          if (aiTier >= 4 && u.atkRange > 5 && d < 3.5) {
            // Thả diều lùi nhẹ về phía nhà mình
            this.moveTowards(u, u.spawnX, u.z, dt * 0.6);
          }
          if (u.atkCd <= 0) {
            this.performBasicAttack(u, target);
          }
        }
      } else if (u.kind === 'HERO' || u.kind === 'MINION') {
        // Đẩy dọc theo đường chính về phía Nhà Chính địch
        const goalX = u.team === 'BLUE' ? 44 : -44;
        this.moveTowards(u, goalX, 0, dt);
      } else if (u.kind === 'JUNGLE' || u.kind === 'BOSS') {
        // Quái rừng quay về bãi nếu không có mục tiêu
        if (this.distCoords(u.x, u.z, u.homeX, u.homeZ) > 0.5) {
          this.moveTowards(u, u.homeX, u.homeZ, dt);
        }
      }
    }

    autoBuyBotItem(bot) {
      const builds = {
        Mage: ['B03', 'M01', 'M02', 'M03', 'M05', 'M07'],
        Tank: ['B02', 'T01', 'T02', 'T03', 'T04', 'T06'],
        Assassin: ['B04', 'P01', 'P02', 'P08', 'P05', 'P07'], // Sát thủ Bot cũng biết lên P01 & P08 Thiên Kiếm
        Fighter: ['B01', 'P01', 'P03', 'P08', 'T03', 'T06']
      };
      const plan = builds[bot.role] || builds.Fighter;
      const nextId = plan.find((id) => !bot.items.includes(id));
      if (!nextId) return;
      const item = ITEMS.find((x) => x.id === nextId);
      if (item && bot.gold >= item.cost) {
        this.buyItemForUnit(bot, nextId);
      }
    }

    findBestTarget(unit, searchRadius) {
      let best = null;
      let bestScore = 999999;

      for (let i = 0; i < this.units.length; i++) {
        const cand = this.units[i];
        if (cand.dead || cand === unit || cand.team === unit.team) continue;

        // Quái rừng chỉ đánh kẻ đứng gần bãi của nó
        if ((unit.kind === 'JUNGLE' || unit.kind === 'BOSS') && this.distCoords(cand.x, cand.z, unit.homeX, unit.homeZ) > 9.5) {
          continue;
        }
        // Tướng/Lính trên đường chính không tự ý rẽ vào đánh Boss nếu không đứng gần
        if ((cand.kind === 'JUNGLE' || cand.kind === 'BOSS') && this.dist(unit, cand) > 6.5) {
          continue;
        }
        // Không thể chọn mục tiêu đang Tàng hình (Kaelen W) hoặc đứng trong Bụi cỏ khi mình ở ngoài
        if (cand.kind === 'HERO') {
          if (cand.stealthTimer > 0 && this.dist(unit, cand) > 2.2) continue;
          const candInBush = this.world.isInsideBush(cand.x, cand.z);
          const unitInBush = this.world.isInsideBush(unit.x, unit.z);
          if (candInBush && !unitInBush && this.dist(unit, cand) > 2.5) continue;
        }
        if (cand.kind === 'STRUCTURE' && !this.canAttackStructure(unit, cand)) continue;

        const d = this.dist(unit, cand);
        if (d > searchRadius) continue;

        // Ưu tiên mục tiêu thấp máu ở Rank cao
        let score = d;
        if (cand.kind === 'HERO' && cand.hp / cand.maxHp < 0.35) score -= 4;
        if (score < bestScore) {
          bestScore = score;
          best = cand;
        }
      }
      return best;
    }

    moveTowards(u, tx, tz, dt) {
      const dx = tx - u.x;
      const dz = tz - u.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.15) return;

      const slowMult = u.slowTimer > 0 ? 1 - (u.slowFactor || 0.25) : 1;
      const stealthBonus = u.stealthTimer > 0 ? 1.4 : 1.0;
      const speed = (u.moveSpeed / 60) * slowMult * stealthBonus;

      u.x = Math.max(-52, Math.min(52, u.x + (dx / d) * speed * dt));
      u.z = Math.max(-20, Math.min(20, u.z + (dz / d) * speed * dt));
      u.mesh.lookAt(tx, u.mesh.position.y, tz);
    }

    dist(a, b) {
      return Math.hypot(a.x - b.x, a.z - b.z);
    }

    distCoords(x1, z1, x2, z2) {
      return Math.hypot(x1 - x2, z1 - z2);
    }

    // ==================== 7. ĐIỀU KHIỂN PC (WASD/CHUỘT/QWE) & MOBILE JOYSTICK ====================
    initControls() {
      window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        this.keys[k] = true;
        if (!this.matchActive || !this.player) return;
        if (k === 'q') this.castSkill(this.player, 0);
        if (k === 'w' && !this.keys['control']) {
          // Nếu không dùng W để đi lên thì có thể nhấn nút kỹ năng trên màn hình,
          // hoặc nhấn phím 1 / 2 / 3 cho chiêu 1 / 2 / 3
        }
        if (k === '1') this.castSkill(this.player, 0);
        if (k === '2') this.castSkill(this.player, 1);
        if (k === '3' || k === 'e') this.castSkill(this.player, 2);
        if (k === 'b') this.triggerRecallHeal();
        if (k === ' ') {
          e.preventDefault();
          this.playerManualAttack();
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
      });

      // Click chuột phải trên mặt đất để di chuyển chuẩn MOBA PC
      const container = document.getElementById('webgl-container');
      container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!this.matchActive || !this.player || this.player.dead) return;
        const pt = this.world.getGroundPointFromMouse(e.clientX, e.clientY);
        if (pt) {
          this.moveTarget = { x: pt.x, z: pt.z };
          this.world.spawnVFX('aoe', pt.x, pt.z, 0x38bdf8, 0.8, 0.25);
        }
      });

      // Các nút bấm kỹ năng trên màn hình
      document.getElementById('btn-skill-1').addEventListener('click', () => this.player && this.castSkill(this.player, 0));
      document.getElementById('btn-skill-2').addEventListener('click', () => this.player && this.castSkill(this.player, 1));
      document.getElementById('btn-skill-3').addEventListener('click', () => this.player && this.castSkill(this.player, 2));
      document.getElementById('btn-skill-recall').addEventListener('click', () => this.triggerRecallHeal());
      document.getElementById('btn-basic-attack').addEventListener('click', () => this.playerManualAttack());

      // Joystick ảo cảm ứng / kéo chuột
      const base = document.getElementById('joystick-base');
      const stick = document.getElementById('joystick-stick');
      let dragging = false;

      const updateStick = (clientX, clientY) => {
        const rect = base.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const maxR = 36;
        const d = Math.hypot(dx, dy);
        if (d > maxR) {
          dx = (dx / d) * maxR;
          dy = (dy / d) * maxR;
        }
        stick.style.transform = `translate(${dx}px, ${dy}px)`;
        this.joyVec.x = dx / maxR;
        this.joyVec.z = dy / maxR;
        this.moveTarget = null;
      };

      const resetStick = () => {
        dragging = false;
        stick.style.transform = 'translate(0px, 0px)';
        this.joyVec.x = 0;
        this.joyVec.z = 0;
      };

      base.addEventListener('pointerdown', (e) => {
        dragging = true;
        base.setPointerCapture(e.pointerId);
        updateStick(e.clientX, e.clientY);
      });
      base.addEventListener('pointermove', (e) => {
        if (dragging) updateStick(e.clientX, e.clientY);
      });
      base.addEventListener('pointerup', resetStick);
      base.addEventListener('pointercancel', resetStick);
    }

    playerManualAttack() {
      if (!this.player || this.player.dead || this.player.stunTimer > 0 || this.player.atkCd > 0) return;
      const target = this.findBestTarget(this.player, this.player.atkRange + 1.5);
      if (target) {
        this.performBasicAttack(this.player, target);
      }
    }

    triggerRecallHeal() {
      if (!this.player || this.player.dead || this.player.recallCd > 0) return;
      this.player.recallCd = 35;
      const heal = Math.round(this.player.maxHp * 0.18);
      const mana = Math.round(this.player.maxMp * 0.25);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + mana);
      this.world.spawnVFX('shield_aoe', this.player.x, this.player.z, 0x22c55e, 2.5, 0.6);
      this.world.spawnFloatingText(this.player.x, 2.5, this.player.z, `+${heal} HP`, '#4ade80');
    }

    // ==================== 8. SHOP TRONG TRẬN & CẬP NHẬT HUD ====================
    setupPlayerSkillHUD(hero) {
      document.getElementById('hud-hero-name').textContent = hero.name;
      document.getElementById('hud-passive-name').textContent = hero.passive.name;
      document.getElementById('hud-passive-slot').title = `${hero.passive.name}: ${hero.passive.desc}`;

      hero.skills.forEach((sk, idx) => {
        const n = idx + 1;
        document.getElementById(`icon-skill-${n}`).textContent = sk.icon;
        document.getElementById(`name-skill-${n}`).textContent = sk.name;
        document.getElementById(`btn-skill-${n}`).title = `[${sk.key}] ${sk.name}: ${sk.desc}`;
      });
    }

    renderIngameShopModal() {
      if (!this.player) return;
      document.getElementById('shop-ingame-gold').textContent = Math.floor(this.player.gold);
      const grid = document.getElementById('ingame-items-grid');
      const inspector = document.getElementById('ingame-item-inspector');
      grid.innerHTML = '';

      const list = ITEMS.filter((it) => this.selectedItemCat === 'ALL' || it.category === this.selectedItemCat);
      if (!this.inspectedItemId) this.inspectedItemId = 'P08'; // Mặc định hiển thị P08 Thiên Kiếm mới cập nhật

      list.forEach((it) => {
        const card = document.createElement('div');
        card.className = `hero-card ${this.inspectedItemId === it.id ? 'selected' : ''}`;
        card.innerHTML = `
          <div style="font-size:11px;color:#38bdf8;font-weight:800">[${it.id}] ${it.category}</div>
          <strong style="font-size:13px;color:#f8fafc">${it.nameVi}</strong>
          <div style="font-size:11px;color:#94a3b8">${it.nameEn}</div>
          <div style="font-size:13px;color:#fbbf24;font-weight:800;margin-top:4px">${it.cost} 🪙</div>
        `;
        card.addEventListener('click', () => {
          this.inspectedItemId = it.id;
          this.renderIngameShopModal();
        });
        grid.appendChild(card);
      });

      const cur = ITEMS.find((x) => x.id === this.inspectedItemId) || ITEMS[0];
      const canAfford = this.player.gold >= cur.cost && this.player.items.length < 6;

      inspector.innerHTML = `
        <div style="font-size:12px;color:#38bdf8;font-weight:800">MÃ TRANG BỊ: ${cur.id} (${cur.category})</div>
        <h3 style="font-size:22px;color:#fbbf24;margin:4px 0">${cur.nameVi}</h3>
        <div style="font-size:14px;color:#cbd5e1;margin-bottom:10px">${cur.nameEn} — Giá: <b style="color:#fde68a">${cur.cost} 🪙</b></div>
        <div class="skill-box" style="margin-bottom:12px">
          <strong>${cur.passiveName}:</strong><br>${cur.passiveDesc}
        </div>
        <button class="btn-buy btn-buy-gold" id="btn-buy-ingame-now" style="width:100%;padding:12px;font-size:14px" ${canAfford ? '' : 'disabled'}>
          ${this.player.items.length >= 6 ? 'ĐÃ ĐẦY 6 Ô TRANG BỊ' : canAfford ? `MUA TRANG BỊ (${cur.cost} 🪙)` : 'CHƯA ĐỦ VÀNG TRONG TRẬN'}
        </button>
      `;

      const btnBuy = document.getElementById('btn-buy-ingame-now');
      if (btnBuy && canAfford) {
        btnBuy.addEventListener('click', () => {
          this.buyItemForUnit(this.player, cur.id);
        });
      }
    }

    updateHUD() {
      if (!this.player) return;
      const p = this.player;

      document.getElementById('hud-score-blue').textContent = this.scoreBlue;
      document.getElementById('hud-score-red').textContent = this.scoreRed;

      const mins = String(Math.floor(this.matchTime / 60)).padStart(2, '0');
      const secs = String(Math.floor(this.matchTime % 60)).padStart(2, '0');
      document.getElementById('hud-match-timer').textContent = `${mins}:${secs}`;

      if (this.bossAlive) {
        document.getElementById('hud-boss-status').textContent = '🐉 Boss: ĐANG HIỆN DIỆN!';
      } else {
        const rem = Math.max(0, Math.ceil(this.bossNextSpawn - this.matchTime));
        document.getElementById('hud-boss-status').textContent = `Boss xuất hiện sau: ${rem}s`;
      }

      document.getElementById('hud-gold-text').textContent = Math.floor(p.gold);
      document.getElementById('hud-hero-level').textContent = `Lv.${p.level}`;
      document.getElementById('hud-kda').textContent = `${p.kills} / ${p.deaths} / ${p.assists}`;

      const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
      const shPct = Math.max(0, Math.min(100, (p.shield / p.maxHp) * 100));
      const mpPct = Math.max(0, Math.min(100, (p.mp / p.maxMp) * 100));
      const expNeeded = 180 + p.level * 95;
      const expPct = p.level >= 15 ? 100 : Math.min(100, (p.exp / expNeeded) * 100);

      document.getElementById('hud-hp-bar').style.width = `${hpPct}%`;
      document.getElementById('hud-shield-bar').style.width = `${shPct}%`;
      document.getElementById('hud-hp-text').textContent = `${Math.ceil(p.hp)}${p.shield > 0 ? ` (+${Math.ceil(p.shield)})` : ''} / ${p.maxHp}`;
      document.getElementById('hud-mp-bar').style.width =
