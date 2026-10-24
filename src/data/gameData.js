/**
 * ASTRAL ARENA 3D - DỮ LIỆU GAME (v1.0.0)
 * Bao gồm: 25 Trang bị (đã cập nhật P01: +200 Công VL & thêm P08: Thiên Kiếm),
 * 12 Nhân vật (4 Hệ), Skins, và 14 Bậc Rank.
 */
window.MOBA = window.MOBA || {};

(function (MOBA) {
  // ==================== 1. HỆ THỐNG 25 TRANG BỊ TRONG TRẬN ====================
  const ITEMS = [
    // NHÁNH GIÀY (4)
    {
      id: 'B01',
      nameEn: 'Sonic Greaves',
      nameVi: 'Giày Hộ Vệ',
      category: 'Boots',
      cost: 700,
      stats: { moveSpeed: 60, armor: 110 },
      passiveName: 'Hộ Vệ',
      passiveDesc: 'Giảm 15% sát thương vật lý nhận từ đòn đánh thường.'
    },
    {
      id: 'B02',
      nameEn: 'Gilded Boots',
      nameVi: 'Giày Kiên Cường',
      category: 'Boots',
      cost: 720,
      stats: { moveSpeed: 60, mr: 110, tenacity: 0.35 },
      passiveName: 'Kiên Cường',
      passiveDesc: '+35% Kháng hiệu ứng (giảm thời gian bị choáng và làm chậm).'
    },
    {
      id: 'B03',
      nameEn: 'Arcane Treads',
      nameVi: 'Giày Phù Thủy',
      category: 'Boots',
      cost: 710,
      stats: { moveSpeed: 60, cdr: 0.10, mgPenFlat: 75 },
      passiveName: 'Ma Pháp',
      passiveDesc: '+75 Xuyên Giáp Phép cố định.'
    },
    {
      id: 'B04',
      nameEn: 'Swift Warboots',
      nameVi: 'Giày Du Mục',
      category: 'Boots',
      cost: 690,
      stats: { moveSpeed: 60, atkSpeed: 0.25 },
      passiveName: 'Hồi Phục Nhẹ',
      passiveDesc: 'Mỗi đòn đánh thường trúng đích hồi 15 Máu.'
    },

    // NHÁNH CÔNG VẬT LÝ (8 - Đã cập nhật P01 = +200 Công VL và thêm P08 Thiên Kiếm)
    {
      id: 'P01',
      nameEn: 'Rankbreaker',
      nameVi: 'Thương Xuyên Phá',
      category: 'Physical',
      cost: 2020,
      stats: { ad: 200, cdr: 0.10, arPenFlat: 120 },
      passiveName: 'Xuyên Thấu',
      passiveDesc: '+200 Công VL. Tăng (100 + Cấp*10) Xuyên Giáp VL và +8% Tốc chạy khi rời giao tranh.'
    },
    {
      id: 'P02',
      nameEn: 'Claves Sancti',
      nameVi: 'Thánh Kiếm',
      category: 'Physical',
      cost: 2150,
      stats: { ad: 110, crit: 0.25, critDmgBonus: 0.25 },
      passiveName: 'Thần Phạt',
      passiveDesc: 'Sát thương chí mạng tăng lên 225%; đòn chí mạng tăng 20% tốc chạy trong 1.5s.'
    },
    {
      id: 'P03',
      nameEn: 'Omni Arms',
      nameVi: 'Phức Hợp Kiếm',
      category: 'Physical',
      cost: 2180,
      stats: { ad: 75, atkSpeed: 0.15, lifesteal: 0.10, cdr: 0.10, hp: 500 },
      passiveName: 'Cuồng Bạo',
      passiveDesc: 'Sau khi dùng kỹ năng, đòn đánh thường kế tiếp gây thêm 100% Công VL (Hồi chiêu: 2s).'
    },
    {
      id: 'P04',
      nameEn: 'Bloodthirst Blade',
      nameVi: 'Kiếm Huyết Tinh',
      category: 'Physical',
      cost: 2000,
      stats: { ad: 100, lifesteal: 0.25 },
      passiveName: 'Huyết Khiên',
      passiveDesc: 'Khi máu dưới 30%, nhận khiên chắn (450 + Cấp*50) trong 4s (Hồi chiêu: 60s).'
    },
    {
      id: 'P05',
      nameEn: 'Muramasa',
      nameVi: 'Kiếm Muramasa',
      category: 'Physical',
      cost: 2050,
      stats: { ad: 80, cdr: 0.10, arPenPct: 0.45 },
      passiveName: 'Phá Giáp',
      passiveDesc: '+45% Xuyên Giáp Vật Lý.'
    },
    {
      id: 'P06',
      nameEn: 'Shadow Ripper',
      nameVi: 'Vuốt Hung Tàn',
      category: 'Physical',
      cost: 1950,
      stats: { atkSpeed: 0.35, crit: 0.25, moveSpeed: 20 },
      passiveName: 'Hành Quyết',
      passiveDesc: 'Đòn đánh thường tăng thêm 15% Tốc đánh và 5% Chí mạng trong 3s.'
    },
    {
      id: 'P07',
      nameEn: "Fenrir's Tooth",
      nameVi: 'Nanh Fenrir',
      category: 'Physical',
      cost: 2950,
      stats: { ad: 200 },
      passiveName: 'Chinh Phạt',
      passiveDesc: 'Gây thêm 30% tổng sát thương lên mục tiêu có lượng máu dưới 50%.'
    },
    {
      id: 'P08',
      nameEn: 'Celestial Sword',
      nameVi: 'Thiên Kiếm',
      category: 'Physical',
      cost: 2350,
      stats: { ad: 100 },
      passiveName: 'Nội Tại Duy Nhất - Thiên Mệnh Bất Diệt',
      passiveDesc: 'Khi nhận đòn ST chí tử, bản thân chặn sát thương tử vong và nhận Bất Tử kèm Miễn Nhiễm Choáng trong 2s (Hồi chiêu: 90s).'
    },

    // NHÁNH CÔNG PHÉP (7)
    {
      id: 'M01',
      nameEn: 'Boomstick',
      nameVi: 'Trượng Bùng Nổ',
      category: 'Magic',
      cost: 2000,
      stats: { ap: 240, mp: 300 },
      passiveName: 'Bùng Nổ',
      passiveDesc: 'Kỹ năng trúng đích tạo vụ nổ nhỏ gây thêm (120 + 40% Công Phép) ST phép (Hồi chiêu: 5s).'
    },
    {
      id: 'M02',
      nameEn: "Hecate's Diadem",
      nameVi: 'Vương Miện Hecate',
      category: 'Magic',
      cost: 2300,
      stats: { ap: 240, apPercentBonus: 0.35, mgPenFlat: 75 },
      passiveName: 'Ma Thuật Tối Thượng',
      passiveDesc: 'Tăng thêm +35% tổng Công Phép và +75 Xuyên Giáp Phép.'
    },
    {
      id: 'M03',
      nameEn: "Frosty's Revenge",
      nameVi: 'Trượng Băng',
      category: 'Magic',
      cost: 1980,
      stats: { ap: 160, hp: 600, moveSpeed: 20 },
      passiveName: 'Đóng Băng',
      passiveDesc: 'Kỹ năng gây sát thương sẽ làm chậm 25% tốc chạy của địch trong 2s.'
    },
    {
      id: 'M04',
      nameEn: "Rhea's Blessing",
      nameVi: 'Quyền Trượng Rhea',
      category: 'Magic',
      cost: 2100,
      stats: { ap: 160, cdr: 0.10, spellVamp: 0.25 },
      passiveName: 'Khiên Phép',
      passiveDesc: '+25% Hút máu phép. Dưới 40% máu nhận khiên (500 + 80% Công Phép) trong 4s (Hồi chiêu: 60s).'
    },
    {
      id: 'M05',
      nameEn: 'Staff of Nuul',
      nameVi: 'Trượng Hỗn Mang',
      category: 'Magic',
      cost: 2020,
      stats: { ap: 180, cdr: 0.10, mgPenPct: 0.45 },
      passiveName: 'Xuyên Tâm',
      passiveDesc: '+45% Xuyên Giáp Phép.'
    },
    {
      id: 'M06',
      nameEn: 'Apocalypse',
      nameVi: 'Thập Tự Kiếm',
      category: 'Magic',
      cost: 2120,
      stats: { ap: 180, cdr: 0.10, mp: 400 },
      passiveName: 'Lời Nguyền',
      passiveDesc: 'Sau khi dùng chiêu, đòn đánh thường kế tiếp gây thêm (100 + 70% Công Phép) ST phép (Hồi chiêu: 2s).'
    },
    {
      id: 'M07',
      nameEn: 'Holy of Holies',
      nameVi: 'Sách Thánh',
      category: 'Magic',
      cost: 2990,
      stats: { ap: 400, hp: 1400 },
      passiveName: 'Khai Sáng',
      passiveDesc: 'Tăng +400 Công Phép và +1400 Máu tối đa.'
    },

    // NHÁNH ĐỠ ĐÒN (6)
    {
      id: 'T01',
      nameEn: 'The Aegis',
      nameVi: 'Khiên Huyền Thoại',
      category: 'Defense',
      cost: 2080,
      stats: { armor: 360, cdr: 0.20, mp: 500 },
      passiveName: 'Lãnh Khốc',
      passiveDesc: 'Kẻ địch tấn công bạn bị giảm 30% Tốc đánh và 15% Tốc chạy trong 2.5s.'
    },
    {
      id: 'T02',
      nameEn: 'Medallion of Troy',
      nameVi: 'Huân Chương Troy',
      category: 'Defense',
      cost: 2000,
      stats: { mr: 360, hp: 1000, cdr: 0.10 },
      passiveName: 'Phước Lành',
      passiveDesc: 'Mỗi 15s nhận lớp khiên hấp thụ (400 + Cấp*50) sát thương.'
    },
    {
      id: 'T03',
      nameEn: 'Mail of Pain',
      nameVi: 'Giáp Thống Khổ',
      category: 'Defense',
      cost: 1940,
      stats: { armor: 350, hp: 1200 },
      passiveName: 'Phản Đòn',
      passiveDesc: 'Phản lại 15% sát thương vật lý nhận vào thành sát thương phép lên kẻ tấn công.'
    },
    {
      id: 'T04',
      nameEn: "Gaia's Standard",
      nameVi: 'Giáp Gaia',
      category: 'Defense',
      cost: 1960,
      stats: { mr: 240, hp: 1200, moveSpeed: 20 },
      passiveName: 'Hồi Sinh Sinh Lực',
      passiveDesc: 'Khi chịu sát thương, hồi lại 8% Máu tối đa (Hồi chiêu: 10s).'
    },
    {
      id: 'T05',
      nameEn: 'Amulet of Longevity',
      nameVi: 'Phù Chú Trường Sinh',
      category: 'Defense',
      cost: 2600,
      stats: { hp: 2000 },
      passiveName: 'Bất Diệt',
      passiveDesc: 'Tăng 15% hiệu ứng hồi máu; mỗi giây hồi 2% Máu tối đa khi không giao tranh.'
    },
    {
      id: 'T06',
      nameEn: 'Blade of Eternity',
      nameVi: 'Giáp Hộ Mệnh',
      category: 'Defense',
      cost: 2250,
      stats: { armor: 200, mr: 200, hp: 800 },
      passiveName: 'Phục Sinh',
      passiveDesc: 'Hồi sinh tại chỗ với 2500 Máu khi nhận ST kết liễu (Tối đa 2 lần/trận, hồi chiêu 150s).'
    }
  ];

  // ==================== 2. HỆ THỐNG 12 NHÂN VẬT & SKIN 3D ====================
  const HEROES = [
    // --- PHÁP SƯ (MAGE) ---
    {
      id: 'aurelia',
      name: 'AURELIA',
      title: 'The Astral Weaver',
      role: 'Mage',
      roleVi: 'Pháp Sư',
      icon: '🌌',
      freeStarter: true,
      priceGold: 0,
      priceDiamond: 0,
      baseStats: { hp: 3150, mp: 520, ad: 155, ap: 60, armor: 95, mr: 80, atkRange: 7.5, moveSpeed: 365 },
      visual: {
        bodyColor: 0x3b82f6,
        accentColor: 0x93c5fd,
        weaponType: 'staff',
        weaponColor: 0xfbbf24,
        vfxColor: 0x60a5fa,
        scale: 1.0
      },
      skins: [
        { id: 'default', name: 'Tinh Tú Mặc Định', priceDiamond: 0, bodyColor: 0x3b82f6, weaponColor: 0xfbbf24, vfxColor: 0x60a5fa },
        { id: 'bloodmoon', name: 'Aurelia Huyết Nguyệt', priceDiamond: 299, bodyColor: 0x991b1b, weaponColor: 0xf43f5e, vfxColor: 0xfb7185 }
      ],
      passive: {
        name: 'Starlight Resonance',
        desc: 'Mỗi 3 lần tung chiêu kích hoạt vụ nổ tinh vân gây thêm 8% Máu tối đa của mục tiêu thành ST phép và hồi 5% Mana.'
      },
      skills: [
        { key: 'Q', name: 'Comet Bolt', icon: '☄️', cd: 5, mpCost: 45, dmgBase: 280, apRatio: 0.75, adRatio: 0, type: 'projectile', slow: 0.3, desc: 'Bắn sao chổi xuyên phá gây ST phép và làm chậm 30%.' },
        { key: 'W', name: 'Gravity Singularity', icon: '🌀', cd: 9, mpCost: 65, dmgBase: 340, apRatio: 0.85, adRatio: 0, type: 'aoe', stun: 1.0, desc: 'Tạo vùng lỗ đen hút nhẹ và làm choáng kẻ địch 1 giây.' },
        { key: 'E', name: 'Supernova Judgment', icon: '🌟', cd: 24, mpCost: 100, dmgBase: 640, apRatio: 1.35, adRatio: 0, type: 'meteor', stun: 1.2, desc: 'Triệu hồi Siêu Tân Tinh giáng xuống gây ST phép cực lớn và hất tung 1.2s.' }
      ]
    },
    {
      id: 'ignis',
      name: 'IGNIS',
      title: 'The Hellfire Archon',
      role: 'Mage',
      roleVi: 'Pháp Sư',
      icon: '🔥',
      freeStarter: false,
      priceGold: 13888,
      priceDiamond: 299,
      baseStats: { hp: 3250, mp: 500, ad: 160, ap: 70, armor: 100, mr: 85, atkRange: 7.2, moveSpeed: 365 },
      visual: {
        bodyColor: 0x7c2d12,
        accentColor: 0xf97316,
        weaponType: 'orbs',
        weaponColor: 0xff4500,
        vfxColor: 0xf97316,
        scale: 1.02
      },
      skins: [
        { id: 'default', name: 'Chúa Tể Lửa Ngục', priceDiamond: 0, bodyColor: 0x7c2d12, weaponColor: 0xff4500, vfxColor: 0xf97316 },
        { id: 'blueflame', name: 'Ignis Minh Hỏa Lam', priceDiamond: 349, bodyColor: 0x0f172a, weaponColor: 0x06b6d4, vfxColor: 0x22d3ee }
      ],
      passive: {
        name: 'Searing Brand',
        desc: 'Kỹ năng khắc Ấn Lửa thiêu đốt mục tiêu và gây thêm sát thương chuẩn mỗi đòn thứ 3.'
      },
      skills: [
        { key: 'Q', name: 'Fireball Barrage', icon: '🔥', cd: 4.5, mpCost: 40, dmgBase: 290, apRatio: 0.8, adRatio: 0, type: 'cone', desc: 'Phóng chuỗi cầu lửa hình nón phía trước gây ST phép.' },
        { key: 'W', name: 'Magma Pillar', icon: '🌋', cd: 8, mpCost: 60, dmgBase: 350, apRatio: 0.85, adRatio: 0, type: 'aoe', stun: 1.0, desc: 'Phun trào cột dung nham dưới chân kẻ địch, hất tung 1s.' },
        { key: 'E', name: 'Cataclysmic Inferno', icon: '☄️', cd: 26, mpCost: 110, dmgBase: 700, apRatio: 1.4, adRatio: 0, type: 'storm', slow: 0.35, desc: 'Tạo bão lửa hủy diệt diện rộng gây ST phép kèm ST chuẩn.' }
      ]
    },
    {
      id: 'glacia',
      name: 'GLACIA',
      title: 'The Frost Sovereign',
      role: 'Mage',
      roleVi: 'Pháp Sư',
      icon: '❄️',
      freeStarter: false,
      priceGold: 18888,
      priceDiamond: 399,
      baseStats: { hp: 3180, mp: 540, ad: 150, ap: 65, armor: 95, mr: 90, atkRange: 7.5, moveSpeed: 365 },
      visual: {
        bodyColor: 0x0284c7,
        accentColor: 0xe0f2fe,
        weaponType: 'staff',
        weaponColor: 0x7dd3fc,
        vfxColor: 0x38bdf8,
        scale: 1.0
      },
      skins: [
        { id: 'default', name: 'Nữ Hoàng Băng Giá', priceDiamond: 0, bodyColor: 0x0284c7, weaponColor: 0x7dd3fc, vfxColor: 0x38bdf8 },
        { id: 'aurora', name: 'Glacia Cực Quang', priceDiamond: 399, bodyColor: 0x4f46e5, weaponColor: 0xa7f3d0, vfxColor: 0x34d399 }
      ],
      passive: {
        name: 'Permafrost',
        desc: 'Kỹ năng làm chậm 20% và gây thêm 25% sát thương phép lên mục tiêu đang bị làm chậm/choáng.'
      },
      skills: [
        { key: 'Q', name: 'Glacial Lance', icon: '🧊', cd: 5, mpCost: 45, dmgBase: 300, apRatio: 0.8, adRatio: 0, type: 'projectile', slow: 0.35, desc: 'Phóng mũi thương băng xuyên thấu gây ST phép và làm chậm.' },
        { key: 'W', name: 'Crystal Barrier', icon: '🛡️', cd: 10, mpCost: 65, dmgBase: 260, apRatio: 0.65, adRatio: 0, type: 'shield_aoe', shield: 550, stun: 1.0, desc: 'Tạo khiên băng bảo vệ bản thân và đóng băng kẻ địch áp sát 1s.' },
        { key: 'E', name: 'Absolute Zero Blizzard', icon: '🌨️', cd: 28, mpCost: 110, dmgBase: 650, apRatio: 1.3, adRatio: 0, type: 'storm', stun: 1.4, desc: 'Triệu hồi bão tuyết tuyệt đối làm choáng diện rộng 1.4s.' }
      ]
    },

    // --- ĐỠ ĐÒN (TANK) ---
    {
      id: 'vanguard',
      name: 'VANGUARD',
      title: 'The Iron Bastion',
      role: 'Tank',
      roleVi: 'Đỡ Đòn',
      icon: '🛡️',
      freeStarter: true,
      priceGold: 0,
      priceDiamond: 0,
      baseStats: { hp: 4350, mp: 380, ad: 175, ap: 0, armor: 185, mr: 140, atkRange: 2.8, moveSpeed: 375 },
      visual: {
        bodyColor: 0x475569,
        accentColor: 0xfbbf24,
        weaponType: 'shield_mace',
        weaponColor: 0xfacc15,
        vfxColor: 0xfbbf24,
        scale: 1.22
      },
      skins: [
        { id: 'default', name: 'Pháo Đài Thép', priceDiamond: 0, bodyColor: 0x475569, weaponColor: 0xfacc15, vfxColor: 0xfbbf24 },
        { id: 'mecha', name: 'Vanguard Siêu Giáp', priceDiamond: 299, bodyColor: 0xd97706, weaponColor: 0x38bdf8, vfxColor: 0x38bdf8 }
      ],
      passive: {
        name: 'Unbreakable Bulwark',
        desc: 'Giảm 12% mọi sát thương nhận vào; mỗi kỹ năng tung ra tạo lá chắn bằng 8% Máu tối đa.'
      },
      skills: [
        { key: 'Q', name: 'Shield Charge', icon: '🏃', cd: 6.5, mpCost: 40, dmgBase: 260, apRatio: 0, adRatio: 0.9, type: 'dash', stun: 1.0, desc: 'Lao khiên tới trước húc văng và làm choáng kẻ địch 1s.' },
        { key: 'W', name: 'Aegis Phalanx', icon: '🛡️', cd: 9, mpCost: 50, dmgBase: 240, apRatio: 0, adRatio: 0.7, type: 'shield_aoe', shield: 700, slow: 0.4, desc: 'Nhận khiên chắn lớn 700 máu và phát sóng chấn động làm chậm 40%.' },
        { key: 'E', name: 'Sanctuary Dome', icon: '🏛️', cd: 30, mpCost: 90, dmgBase: 480, apRatio: 0, adRatio: 1.2, type: 'aoe', stun: 1.5, desc: 'Đập khiên tạo Vòm Thánh hất tung địch 1.5s và tăng Giáp.' }
      ]
    },
    {
      id: 'thalor',
      name: 'THALOR',
      title: 'The Earthshaker Titan',
      role: 'Tank',
      roleVi: 'Đỡ Đòn',
      icon: '🪨',
      freeStarter: false,
      priceGold: 13888,
      priceDiamond: 299,
      baseStats: { hp: 4500, mp: 360, ad: 185, ap: 0, armor: 200, mr: 135, atkRange: 2.9, moveSpeed: 370 },
      visual: {
        bodyColor: 0x57534e,
        accentColor: 0x10b981,
        weaponType: 'fists',
        weaponColor: 0x10b981,
        vfxColor: 0x10b981,
        scale: 1.26
      },
      skins: [
        { id: 'default', name: 'Cự Nhân Địa Chấn', priceDiamond: 0, bodyColor: 0x57534e, weaponColor: 0x10b981, vfxColor: 0x10b981 },
        { id: 'magma', name: 'Thalor Nham Thạch', priceDiamond: 299, bodyColor: 0x451a03, weaponColor: 0xef4444, vfxColor: 0xf97316 }
      ],
      passive: {
        name: 'Granite Skin',
        desc: 'Tăng +20% tổng Giáp Vật Lý và đòn đánh thứ 3 đập đất gây sát thương lan.'
      },
      skills: [
        { key: 'Q', name: 'Seismic Slam', icon: '🔨', cd: 6, mpCost: 40, dmgBase: 280, apRatio: 0, adRatio: 0.95, type: 'cone', slow: 0.35, desc: 'Đập đất tạo sóng địa chấn phía trước làm chậm 35%.' },
        { key: 'W', name: 'Tectonic Pull', icon: '🧲', cd: 9.5, mpCost: 55, dmgBase: 250, apRatio: 0, adRatio: 0.8, type: 'shield_aoe', shield: 650, stun: 0.6, desc: 'Tạo từ trường kéo nhẹ kẻ địch quanh thân và nhận lá chắn.' },
        { key: 'E', name: 'Meteor Crash', icon: '☄️', cd: 32, mpCost: 95, dmgBase: 560, apRatio: 0, adRatio: 1.35, type: 'dash', stun: 1.5, desc: 'Lao tới như thiên thạch hất tung toàn bộ kẻ địch trong vùng 1.5s.' }
      ]
    },
    {
      id: 'aegison',
      name: 'AEGISON',
      title: 'The Solar Warden',
      role: 'Tank',
      roleVi: 'Đỡ Đòn',
      icon: '☀️',
      freeStarter: false,
      priceGold: 18888,
      priceDiamond: 399,
      baseStats: { hp: 4250, mp: 420, ad: 175, ap: 40, armor: 175, mr: 155, atkRange: 3.0, moveSpeed: 380 },
      visual: {
        bodyColor: 0xf59e0b,
        accentColor: 0xfef08a,
        weaponType: 'spear_shield',
        weaponColor: 0xfef08a,
        vfxColor: 0xfacc15,
        scale: 1.18
      },
      skins: [
        { id: 'default', name: 'Hộ Vệ Thái Dương', priceDiamond: 0, bodyColor: 0xf59e0b, weaponColor: 0xfef08a, vfxColor: 0xfacc15 },
        { id: 'eclipse', name: 'Aegison Nhật Thực', priceDiamond: 399, bodyColor: 0x311042, weaponColor: 0xc084fc, vfxColor: 0xa855f7 }
      ],
      passive: {
        name: 'Sunfire Aura',
        desc: 'Tỏa nhiệt thiêu đốt kẻ địch xung quanh mỗi giây bằng 2% Máu tối đa.'
      },
      skills: [
        { key: 'Q', name: 'Solar Flare Spear', icon: '⚡', cd: 6, mpCost: 45, dmgBase: 270, apRatio: 0.5, adRatio: 0.85, type: 'dash', stun: 0.9, desc: 'Phóng thương ánh sáng lướt tới áp sát và làm choáng 0.9s.' },
        { key: 'W', name: 'Radiant Blessing', icon: '✨', cd: 10, mpCost: 60, dmgBase: 200, apRatio: 0.6, adRatio: 0.5, type: 'heal_aoe', heal: 520, desc: 'Phát hào quang hồi 520 Máu cho bản thân và đồng đội đứng gần.' },
        { key: 'E', name: 'Dawnbreaker Judgement', icon: '🌞', cd: 30, mpCost: 100, dmgBase: 540, apRatio: 0.9, adRatio: 1.1, type: 'meteor', stun: 1.3, desc: 'Triệu hồi cột sáng Thái Dương giáng xuống gây choáng 1.3s.' }
      ]
    },

    // --- SÁT THỦ (ASSASSIN) ---
    {
      id: 'kaelen',
      name: 'KAELEN',
      title: 'The Shadow Phantom',
      role: 'Assassin',
      roleVi: 'Sát Thủ',
      icon: '🗡️',
      freeStarter: false,
      priceGold: 18888,
      priceDiamond: 399,
      baseStats: { hp: 3250, mp: 400, ad: 215, ap: 0, armor: 105, mr: 85, atkRange: 2.7, moveSpeed: 395 },
      visual: {
        bodyColor: 0x3b0764,
        accentColor: 0xa855f7,
        weaponType: 'daggers',
        weaponColor: 0xc084fc,
        vfxColor: 0xa855f7,
        scale: 1.0
      },
      skins: [
        { id: 'default', name: 'Bóng Ma Đoạt Mạng', priceDiamond: 0, bodyColor: 0x3b0764, weaponColor: 0xc084fc, vfxColor: 0xa855f7 },
        { id: 'cyber', name: 'Kaelen Siêu Việt', priceDiamond: 449, bodyColor: 0x064e3b, weaponColor: 0x10b981, vfxColor: 0x34d399 }
      ],
      passive: {
        name: 'Backstab Execution',
        desc: 'Đòn đánh lên mục tiêu dưới 45% Máu chắc chắn Chí Mạng; hạ gục tướng địch giảm 50% hồi chiêu.'
      },
      skills: [
        { key: 'Q', name: 'Phantom Dash', icon: '💨', cd: 5.5, mpCost: 35, dmgBase: 310, apRatio: 0, adRatio: 1.15, type: 'dash', desc: 'Lướt xuyên qua mục tiêu chém song đao cực nhanh.' },
        { key: 'W', name: 'Shroud of Night', icon: '👤', cd: 10, mpCost: 50, dmgBase: 280, apRatio: 0, adRatio: 1.0, type: 'stealth', stealth: 2.5, desc: 'Ẩn thân tàng hình 2.5s, tăng 40% tốc chạy và cường hóa đòn đánh.' },
        { key: 'E', name: 'Death Mark Dance', icon: '💀', cd: 22, mpCost: 85, dmgBase: 680, apRatio: 0, adRatio: 1.65, type: 'dash', desc: 'Hóa thành 5 luồng bóng tối trảm kích mục tiêu và kích nổ Ấn Tử Thần.' }
      ]
    },
    {
      id: 'nyx',
      name: 'NYX',
      title: 'The Crimson Viper',
      role: 'Assassin',
      roleVi: 'Sát Thủ',
      icon: '🩸',
      freeStarter: false,
      priceGold: 18888,
      priceDiamond: 399,
      baseStats: { hp: 3300, mp: 390, ad: 210, ap: 0, armor: 110, mr: 85, atkRange: 2.7, moveSpeed: 395 },
      visual: {
        bodyColor: 0x7f1d1d,
        accentColor: 0xef4444,
        weaponType: 'daggers',
        weaponColor: 0xf87171,
        vfxColor: 0xef4444,
        scale: 0.98
      },
      skins: [
        { id: 'default', name: 'Huyết Xà Sát Thủ', priceDiamond: 0, bodyColor: 0x7f1d1d, weaponColor: 0xf87171, vfxColor: 0xef4444 },
        { id: 'neon', name: 'Nyx Tử Quang', priceDiamond: 399, bodyColor: 0x1e1b4b, weaponColor: 0xf43f5e, vfxColor: 0xfb7185 }
      ],
      passive: {
        name: 'Venomous Bleed',
        desc: 'Đòn đánh tích Xuất Huyết và cho Nyx +15% Hút máu vật lý tự nhiên.'
      },
      skills: [
        { key: 'Q', name: 'Crimson Pounce', icon: '🐾', cd: 5, mpCost: 35, dmgBase: 300, apRatio: 0, adRatio: 1.1, type: 'dash', desc: 'Nhảy vồ tới quẹt vuốt huyết tinh; hạ gục mục tiêu hồi ngay chiêu.' },
        { key: 'W', name: 'Viper Lash', icon: '🐍', cd: 7.5, mpCost: 45, dmgBase: 290, apRatio: 0, adRatio: 1.0, type: 'projectile', slow: 0.35, desc: 'Phóng phi tiêu độc làm chậm 35% và phá giáp mục tiêu.' },
        { key: 'E', name: 'Guillotine Cross', icon: '❌', cd: 23, mpCost: 85, dmgBase: 640, apRatio: 0, adRatio: 1.55, type: 'true_burst', desc: 'Chém chữ X tốc độ ánh sáng gây ST Vật Lý kèm ST Chuẩn theo máu đã mất.' }
      ]
    },
    {
      id: 'zephyr',
      name: 'ZEPHYR',
      title: 'The Tempest Blade',
      role: 'Assassin',
      roleVi: 'Sát Thủ',
      icon: '🌪️',
      freeStarter: false,
      priceGold: 23888,
      priceDiamond: 499,
      baseStats: { hp: 3350, mp: 380, ad: 220, ap: 0, armor: 115, mr: 90, atkRange: 2.9, moveSpeed: 400 },
      visual: {
        bodyColor: 0x0f766e,
        accentColor: 0x2dd4bf,
        weaponType: 'katana',
        weaponColor: 0x99f6e4,
        vfxColor: 0x2dd4bf,
        scale: 1.02
      },
      skins: [
        { id: 'default', name: 'Kiếm Khách Cuồng Phong', priceDiamond: 0, bodyColor: 0x0f766e, weaponColor: 0x99f6e4, vfxColor: 0x2dd4bf },
        { id: 'shogun', name: 'Zephyr Huyết Kiếm', priceDiamond: 499, bodyColor: 0x111827, weaponColor: 0xf43f5e, vfxColor: 0xf43f5e }
      ],
      passive: {
        name: 'Way of the Wind',
        desc: 'Nhận sẵn +15% Tỷ lệ Chí mạng cơ bản và phóng kiếm khí mỗi đòn thứ 2.'
      },
      skills: [
        { key: 'Q', name: 'Gale Thrust', icon: '🗡️', cd: 4, mpCost: 30, dmgBase: 290, apRatio: 0, adRatio: 1.15, type: 'cone', stun: 0.6, desc: 'Đâm kiếm lốc xoáy nhanh về phía trước gây ST vật lý và hất tung nhẹ.' },
        { key: 'W', name: 'Windwall Step', icon: '🍃', cd: 8.5, mpCost: 45, dmgBase: 250, apRatio: 0, adRatio: 0.9, type: 'dash', shield: 450, desc: 'Lướt nhanh tạo vòng gió hộ thể hấp thụ 450 sát thương.' },
        { key: 'E', name: 'Last Breath Slash', icon: '⚡', cd: 24, mpCost: 85, dmgBase: 710, apRatio: 0, adRatio: 1.7, type: 'dash', stun: 1.0, desc: 'Áp sát chém 3 nhát liên hoàn trên không và tăng xuyên giáp.' }
      ]
    },

    // --- ĐẤU SĨ (FIGHTER) ---
    {
      id: 'valerius',
      name: 'VALERIUS',
      title: 'The Dragonblood Knight',
      role: 'Fighter',
      roleVi: 'Đấu Sĩ',
      icon: '🐉',
      freeStarter: true,
      priceGold: 0,
      priceDiamond: 0,
      baseStats: { hp: 3850, mp: 400, ad: 195, ap: 0, armor: 145, mr: 115, atkRange: 3.1, moveSpeed: 385 },
      visual: {
        bodyColor: 0xb91c1c,
        accentColor: 0xfbbf24,
        weaponType: 'halberd',
        weaponColor: 0xfbbf24,
        vfxColor: 0xf59e0b,
        scale: 1.1
      },
      skins: [
        { id: 'default', name: 'Kỵ Sĩ Long Huyết', priceDiamond: 0, bodyColor: 0xb91c1c, weaponColor: 0xfbbf24, vfxColor: 0xf59e0b },
        { id: 'azure', name: 'Valerius Thanh Long', priceDiamond: 299, bodyColor: 0x1d4ed8, weaponColor: 0x38bdf8, vfxColor: 0x60a5fa }
      ],
      passive: {
        name: "Dragon's Resilience",
        desc: 'Mỗi đòn đánh hoặc kỹ năng trúng đích hồi 2% Máu tối đa và tăng Giáp.'
      },
      skills: [
        { key: 'Q', name: 'Crescent Sweep', icon: '🌙', cd: 5, mpCost: 35, dmgBase: 280, apRatio: 0, adRatio: 1.05, type: 'aoe', heal: 220, desc: 'Quét đại thương 360 độ gây ST vật lý và hồi 220 Máu.' },
        { key: 'W', name: 'Dragon Lunge', icon: '🐲', cd: 7, mpCost: 45, dmgBase: 300, apRatio: 0, adRatio: 1.1, type: 'dash', slow: 0.4, desc: 'Đâm thương rồng lướt tới làm chậm 40%.' },
        { key: 'E', name: 'Skyfall Dragon Strike', icon: '🔥', cd: 25, mpCost: 85, dmgBase: 600, apRatio: 0, adRatio: 1.45, type: 'dash', stun: 1.1, desc: 'Nhảy cắm đại thương rồng xuống đất hất tung kẻ địch 1.1s.' }
      ]
    },
    {
      id: 'ragnar',
      name: 'RAGNAR',
      title: 'The Bloodfury Berserker',
      role: 'Fighter',
      roleVi: 'Đấu Sĩ',
      icon: '🪓',
      freeStarter: false,
      priceGold: 13888,
      priceDiamond: 299,
      baseStats: { hp: 3950, mp: 300, ad: 205, ap: 0, armor: 140, mr: 110, atkRange: 2.9, moveSpeed: 385 },
      visual: {
        bodyColor: 0x78350f,
        accentColor: 0xdc2626,
        weaponType: 'axe',
        weaponColor: 0xef4444,
        vfxColor: 0xef4444,
        scale: 1.14
      },
      skins: [
        { id: 'default', name: 'Chiến Binh Cuồng Nộ', priceDiamond: 0, bodyColor: 0x78350f, weaponColor: 0xef4444, vfxColor: 0xef4444 },
        { id: 'frostking', name: 'Ragnar Băng Vương', priceDiamond: 349, bodyColor: 0x1e3a8a, weaponColor: 0x38bdf8, vfxColor: 0x38bdf8 }
      ],
      passive: {
        name: 'Undying Rage',
        desc: 'Máu càng thấp Tốc đánh và Hút máu càng cao (+20% Hút máu khi dưới 50% máu).'
      },
      skills: [
        { key: 'Q', name: 'Guillotine Cleave', icon: '🪓', cd: 5, mpCost: 25, dmgBase: 310, apRatio: 0, adRatio: 1.15, type: 'cone', heal: 260, desc: 'Bổ đại rìu xuống phía trước gây ST lớn và hồi máu.' },
        { key: 'W', name: 'Whirlwind Rampage', icon: '🌀', cd: 8, mpCost: 40, dmgBase: 330, apRatio: 0, adRatio: 1.1, type: 'aoe', desc: 'Xoay rìu cuồng sát quanh bản thân gây ST diện rộng.' },
        { key: 'E', name: "Berserker's Immortality", icon: '😡', cd: 32, mpCost: 60, dmgBase: 480, apRatio: 0, adRatio: 1.25, type: 'immortal_ult', unyielding: 3.5, desc: 'Kích hoạt Chiến Thần Bất Tử 3.5s (Máu không thể xuống dưới 1) và tăng Công VL.' }
      ]
    },
    {
      id: 'seraphina',
      name: 'SERAPHINA',
      title: 'The Valkyrie of Dawn',
      role: 'Fighter',
      roleVi: 'Đấu Sĩ',
      icon: '⚔️',
      freeStarter: false,
      priceGold: 23888,
      priceDiamond: 499,
      baseStats: { hp: 3780, mp: 420, ad: 205, ap: 45, armor: 140, mr: 120, atkRange: 3.1, moveSpeed: 390 },
      visual: {
        bodyColor: 0xe2e8f0,
        accentColor: 0xfbbf24,
        weaponType: 'greatsword',
        weaponColor: 0xfef08a,
        vfxColor: 0xfacc15,
        scale: 1.06
      },
      skins: [
        { id: 'default', name: 'Chiến Thần Bình Minh', priceDiamond: 0, bodyColor: 0xe2e8f0, weaponColor: 0xfef08a, vfxColor: 0xfacc15 },
        { id: 'fallen', name: 'Seraphina Hắc Thiên Thần', priceDiamond: 499, bodyColor: 0x1e1b4b, weaponColor: 0xc084fc, vfxColor: 0xa855f7 }
      ],
      passive: {
        name: 'Sacred Bladework',
        desc: 'Đòn đánh sau khi tung chiêu gây thêm sát thương phép và giảm 1s hồi chiêu.'
      },
      skills: [
        { key: 'Q', name: 'Valiant Slash', icon: '⚔️', cd: 5.5, mpCost: 40, dmgBase: 310, apRatio: 0.4, adRatio: 1.15, type: 'dash', stun: 0.75, desc: 'Lướt chém Thánh Kiếm và đập đất hất tung 0.75s.' },
        { key: 'W', name: 'Aegis Wings', icon: '🪽', cd: 8, mpCost: 50, dmgBase: 270, apRatio: 0.5, adRatio: 0.9, type: 'shield_aoe', shield: 580, stun: 0.75, desc: 'Bung cánh ánh sáng làm choáng kẻ địch đứng sát và tạo lá chắn 580.' },
        { key: 'E', name: 'Excalibur Awakening', icon: '👑', cd: 26, mpCost: 90, dmgBase: 690, apRatio: 0.7, adRatio: 1.55, type: 'cone', desc: 'Thức tỉnh Thánh Kiếm chém sóng ánh sáng khổng lồ hình nón.' }
      ]
    }
  ];

  // ==================== 3. HỆ THỐNG 14 BẬC RANK (ĐỒNG -> THÁCH THẦN CHÍ TÔN) ====================
  const RANKS = [
    { id: 1, name: 'Đồng', nameEn: 'Bronze', icon: '🥉', minStars: 0, maxStars: 8, aiTier: 1, aiTierName: 'Tân Binh', statMult: 0.88, rewardGold: 500, rewardDia: 50, hardTier: false },
    { id: 2, name: 'Bạc', nameEn: 'Silver', icon: '🥈', minStars: 9, maxStars: 18, aiTier: 1, aiTierName: 'Tân Binh', statMult: 0.94, rewardGold: 800, rewardDia: 80, hardTier: false },
    { id: 3, name: 'Vàng', nameEn: 'Gold', icon: '🥇', minStars: 19, maxStars: 30, aiTier: 1, aiTierName: 'Chiến Binh', statMult: 1.00, rewardGold: 1200, rewardDia: 120, hardTier: false },
    { id: 4, name: 'Kim Cương', nameEn: 'Diamond', icon: '💎', minStars: 31, maxStars: 45, aiTier: 2, aiTierName: 'Tinh Anh', statMult: 1.05, rewardGold: 2000, rewardDia: 200, hardTier: false },
    { id: 5, name: 'Cao Thủ', nameEn: 'Master', icon: '🦅', minStars: 46, maxStars: 65, aiTier: 2, aiTierName: 'Tinh Anh', statMult: 1.10, rewardGold: 3000, rewardDia: 300, hardTier: false },
    { id: 6, name: 'Đại Cao Thủ', nameEn: 'Grandmaster', icon: '⚜️', minStars: 66, maxStars: 85, aiTier: 2, aiTierName: 'Kỳ Cựu', statMult: 1.15, rewardGold: 4000, rewardDia: 400, hardTier: false },
    // Mốc Khó Leo Hơn (Bậc 7 -> 14)
    { id: 7, name: 'Sử Thi', nameEn: 'Epic', icon: '🔮', minStars: 86, maxStars: 105, aiTier: 3, aiTierName: 'Chiến Thuật Cao', statMult: 1.22, rewardGold: 5000, rewardDia: 500, hardTier: true },
    { id: 8, name: 'Huyền Thoại', nameEn: 'Legend', icon: '🌟', minStars: 106, maxStars: 130, aiTier: 3, aiTierName: 'Chiến Thuật Cao', statMult: 1.28, rewardGold: 6000, rewardDia: 600, hardTier: true },
    { id: 9, name: 'Chiến Thần', nameEn: 'War God', icon: '🔥', minStars: 131, maxStars: 160, aiTier: 3, aiTierName: 'Chiến Thần AI', statMult: 1.34, rewardGold: 8000, rewardDia: 800, hardTier: true },
    { id: 10, name: 'Siêu Chiến Thần', nameEn: 'Supreme War God', icon: '⚡', minStars: 161, maxStars: 195, aiTier: 3, aiTierName: 'Chiến Thần AI', statMult: 1.40, rewardGold: 10000, rewardDia: 1000, hardTier: true },
    { id: 11, name: 'Chí Tôn', nameEn: 'Sovereign', icon: '👑', minStars: 196, maxStars: 235, aiTier: 4, aiTierName: 'Thần Thánh (Godlike)', statMult: 1.46, rewardGold: 12000, rewardDia: 1200, hardTier: true },
    { id: 12, name: 'Đại Chí Tôn', nameEn: 'Grand Sovereign', icon: '🌌', minStars: 236, maxStars: 285, aiTier: 4, aiTierName: 'Thần Thánh (Godlike)', statMult: 1.52, rewardGold: 15000, rewardDia: 1500, hardTier: true },
    { id: 13, name: 'Bách Thần Chí Tôn', nameEn: 'Pantheon Sovereign', icon: '🔱', minStars: 286, maxStars: 345, aiTier: 4, aiTierName: 'Bách Thần Tối Thượng', statMult: 1.60, rewardGold: 20000, rewardDia: 2000, hardTier: true },
    { id: 14, name: 'Thách Thần Chí Tôn', nameEn: 'Godslayer Sovereign', icon: '🐉', minStars: 346, maxStars: 9999, aiTier: 4, aiTierName: 'Thách Thần Bất Bại', statMult: 1.70, rewardGold: 30000, rewardDia: 3000, hardTier: true }
  ];

  function getRankByStars(totalStars) {
    const s = Math.max(0, Math.floor(totalStars));
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (s >= RANKS[i].minStars) {
        const tier = RANKS[i];
        const starsInTier = s - tier.minStars;
        return {
          tier,
          starsInTier,
          totalStars: s,
          fullTitle: `${tier.icon} ${tier.name} (${starsInTier} ⭐)`
        };
      }
    }
    return { tier: RANKS[0], starsInTier: 0, totalStars: 0, fullTitle: '🥉 Đồng (0 ⭐)' };
  }

  MOBA.DATA = {
    ITEMS,
    HEROES,
    RANKS,
    getRankByStars
  };
})(window.MOBA);
