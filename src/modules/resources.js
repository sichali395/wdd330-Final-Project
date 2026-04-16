// All 28 districts of Malawi with coordinates
export const malawiDistricts = [
    { name: 'Balaka', lat: -14.9833, lon: 34.9500 },
    { name: 'Blantyre', lat: -15.7861, lon: 35.0058 },
    { name: 'Chikwawa', lat: -16.0333, lon: 34.8000 },
    { name: 'Chiradzulu', lat: -15.7000, lon: 35.1833 },
    { name: 'Chitipa', lat: -9.7000, lon: 33.2667 },
    { name: 'Dedza', lat: -14.3667, lon: 34.3333 },
    { name: 'Dowa', lat: -13.6500, lon: 33.9333 },
    { name: 'Karonga', lat: -9.9333, lon: 33.9333 },
    { name: 'Kasungu', lat: -13.0333, lon: 33.4833 },
    { name: 'Likoma', lat: -12.0667, lon: 34.7333 },
    { name: 'Lilongwe', lat: -13.9833, lon: 33.7833 },
    { name: 'Machinga', lat: -14.9500, lon: 35.5167 },
    { name: 'Mangochi', lat: -14.4833, lon: 35.2667 },
    { name: 'Mchinji', lat: -13.8000, lon: 32.8833 },
    { name: 'Mulanje', lat: -16.0167, lon: 35.5000 },
    { name: 'Mwanza', lat: -15.6167, lon: 34.5167 },
    { name: 'Mzimba', lat: -11.9000, lon: 33.6000 },
    { name: 'Mzuzu', lat: -11.4656, lon: 34.0207 },
    { name: 'Neno', lat: -15.4000, lon: 34.6500 },
    { name: 'Nkhatabay', lat: -11.6000, lon: 34.3000 },
    { name: 'Nkhotakota', lat: -12.9167, lon: 34.3000 },
    { name: 'Nsanje', lat: -16.9167, lon: 35.2667 },
    { name: 'Ntcheu', lat: -14.8167, lon: 34.6333 },
    { name: 'Ntchisi', lat: -13.3667, lon: 33.9167 },
    { name: 'Phalombe', lat: -15.8000, lon: 35.6500 },
    { name: 'Rumphi', lat: -11.0167, lon: 33.8667 },
    { name: 'Salima', lat: -13.7833, lon: 34.4333 },
    { name: 'Thyolo', lat: -16.0667, lon: 35.1333 },
    { name: 'Zomba', lat: -15.3833, lon: 35.3333 }
];

// Traditional Authorities / Villages by district (comprehensive)
export const villageData = {
    balaka: ['Balaka Town', 'Namanolo', 'Ulongwe', 'Kalembo', 'Kankao', 'Mbera'],
    blantyre: ['Limbe', 'Ndirande', 'Bangwe', 'Chilomoni', 'Zingwangwa', 'Mbayani', 'Soche', 'Blantyre City', 'Lunzu'],
    chikwawa: ['Chikwawa Boma', 'Ngabu', 'Makhwira', 'Mthumba', 'Chapananga', 'Mikalango'],
    chiradzulu: ['Chiradzulu Boma', 'Likala', 'Mbulumbuzi', 'Namitambo', 'Mombezi', 'Ntchema'],
    chitipa: ['Chitipa Boma', 'Kameme', 'Nthalire', 'Wenya', 'Kapoka', 'Ifumbo'],
    dedza: ['Dedza Boma', 'Lobi', 'Golomoti', 'Bembeke', 'Mtakataka', 'Linthipe', 'Thete'],
    dowa: ['Dowa Boma', 'Mponela', 'Chibvalo', 'Madisi', 'Nambuma', 'Msakambewa'],
    karonga: ['Karonga Boma', 'Chilumba', 'Kaporo', 'Kyungu', 'Mpata', 'Nyungwe'],
    kasungu: ['Kasungu Boma', 'Chamama', 'Chisemphere', 'Chulu', 'Linthipe', 'Mkanda', 'Kaluluma'],
    likoma: ['Likoma Town', 'Chizumulu'],
    lilongwe: ['Area 18', 'Area 23', 'Area 25', 'Likuni', 'Kawale', 'Chinsapo', 'Mtandire', 'Mchesi', 'Bwaila', 'Kabudula', 'Mitundu', 'Nathenje'],
    machinga: ['Machinga Boma', 'Liwonde', 'Ntaja', 'Nyambi', 'Chikweo', 'Namanja'],
    mangochi: ['Mangochi Boma', 'Monkey Bay', 'Malindi', 'Nankumba', 'Makanjira', 'Lulanga', 'Namwera'],
    mchinji: ['Mchinji Boma', 'Kapiri', 'Mkanda', 'Waliranji', 'Kawere'],
    mulanje: ['Mulanje Boma', 'Limbuli', 'Muloza', 'Chitakale', 'Thuchila', 'Mabuka'],
    mwanza: ['Mwanza Boma', 'Thambani', 'Kunthiranje'],
    mzimba: ['Mzuzu City', 'Ekwendeni', 'Edingeni', 'Embangweni', 'Manyamula', 'Bulala'],
    mzuzu: ['Luwinga', 'Mchengautuwa', 'Chibavi', 'Zolozolo', 'Katawa', 'Msongwe'],
    neno: ['Neno Boma', 'Lisungwi', 'Matope', 'Dambe'],
    nkhatabay: ['Nkhata Bay Boma', 'Chintheche', 'Liwumpa', 'Usisya', 'Fukamalaza'],
    nkhotakota: ['Nkhotakota Boma', 'Dwangwa', 'Bua', 'Mwansambo', 'Linga'],
    nsanje: ['Nsanje Boma', 'Bangula', 'Tengani', 'Makhanga', 'Mbenje'],
    ntcheu: ['Ntcheu Boma', 'Bwanje', 'Tsangano', 'Mlanda', 'Kandeu', 'Mphepozinai'],
    ntchisi: ['Ntchisi Boma', 'Malomo', 'Mponela', 'Kalulu', 'Chisemphere'],
    phalombe: ['Phalombe Boma', 'Muloza', 'Mkhumba', 'Kadewere', 'Nkhulambe'],
    rumphi: ['Rumphi Boma', 'Bolero', 'Katowo', 'Mhuju', 'Phoka'],
    salima: ['Salima Boma', 'Senga Bay', 'Chipoka', 'Lifuwu', 'Khombedza'],
    thyolo: ['Thyolo Boma', 'Luchenza', 'Makwasa', 'Bvumbwe', 'Mikolongwe', 'Thekerani'],
    zomba: ['Zomba City', 'Chancellor', 'Mulunguzi', 'Chikanda', 'Sadanzi', 'Jali', 'Mayaka', 'Mlumbe']
};

// Market schedules
export const marketData = {
    lilongwe: [
        { name: 'Lilongwe Main Market', days: 'Monday - Saturday', time: '6:00 - 18:00' },
        { name: 'Area 23 Market', days: 'Tuesday, Friday, Saturday', time: '7:00 - 17:00' },
        { name: 'Likuni Market', days: 'Wednesday, Saturday', time: '7:00 - 16:00' },
        { name: 'Kawale Market', days: 'Monday, Thursday, Saturday', time: '7:00 - 17:00' }
    ],
    blantyre: [
        { name: 'Limbe Market', days: 'Monday - Saturday', time: '6:00 - 18:00' },
        { name: 'Ndirande Market', days: 'Tuesday, Thursday, Saturday', time: '7:00 - 17:00' },
        { name: 'Bangwe Market', days: 'Wednesday, Saturday', time: '7:00 - 16:00' },
        { name: 'Chilomoni Market', days: 'Monday, Friday', time: '7:00 - 17:00' }
    ],
    mzuzu: [
        { name: 'Mzuzu Main Market', days: 'Monday - Saturday', time: '7:00 - 17:00' },
        { name: 'Luwinga Market', days: 'Tuesday, Friday', time: '7:00 - 16:00' }
    ],
    zomba: [
        { name: 'Zomba Main Market', days: 'Monday - Saturday', time: '7:00 - 17:00' },
        { name: 'Chancellor Market', days: 'Wednesday, Saturday', time: '7:00 - 16:00' }
    ],
    mangochi: [
        { name: 'Mangochi Main Market', days: 'Monday - Saturday', time: '7:00 - 17:00' },
        { name: 'Monkey Bay Market', days: 'Tuesday, Friday', time: '7:00 - 16:00' }
    ],
    kasungu: [
        { name: 'Kasungu Main Market', days: 'Tuesday, Friday, Saturday', time: '7:00 - 16:00' }
    ],
    mzimba: [
        { name: 'Ekwendeni Market', days: 'Wednesday, Saturday', time: '7:00 - 16:00' }
    ],
    karonga: [
        { name: 'Karonga Main Market', days: 'Monday - Saturday', time: '7:00 - 17:00' }
    ],
    salima: [
        { name: 'Salima Main Market', days: 'Monday, Wednesday, Friday', time: '7:00 - 17:00' }
    ]
};