const customList = [
    "Sajt",
    "Füstölt sajt",
    "Csirkemell",
    "Csülök",
    "Darált hús",
    "Füstölt tarja",
    "Kolbász",
    "Sonka",
    "Szalámi",
    "Bacon",
    "Virsli",
    "Rák",
    "Szardínia",
    "Tonhal",
    "Tenger gyümölcsei",
    "Ananász",
    "Bab",
    "Brokkoli",
    "Csemegeuborka",
    "Fokhagymakrém",
    "Gomba",
    "Hagyma",
    "Kukorica",
    "Oliva",
    "Paprika",
    "Paradicsom",
    "Savanyú káposzta",
    "Zöldborsó",
    "Tejföl",
    "Tojás",
    "Erős Pistás alap",
    "Ketchup",
    "Majonéz",
    "Fokhagymás tejfölös mártás",
];

const dummyData = {
    categories: [
        {
            name: "Pizzák",
            description: "Kemencében sült pizzák különféle feltétekkel",
        },
        {
            name: "Tészták",
            description: "Frissen készült olaszos tésztaételek különböző szószokkal",
        },
        {
            name: "Szendvicsek",
            description: "Pirított kenyérből készült, gazdagon töltött club szendvicsek",
        },
        {
            name: "Üdítők",
            description: "Frissítő üdítőitalok az ételek mellé",
        },
    ],

    customizations: [
        // Toppings
        { name: "Sajt", price: 700, type: "topping" },
        { name: "Füstölt sajt", price: 850, type: "topping" },
        { name: "Csirkemell", price: 850, type: "topping" },
        { name: "Csülök", price: 850, type: "topping" },
        { name: "Darált hús", price: 850, type: "topping" },
        { name: "Füstölt tarja", price: 900, type: "topping" },
        { name: "Kolbász", price: 900, type: "topping" },
        { name: "Sonka", price: 500, type: "topping" },
        { name: "Szalámi", price: 850, type: "topping" },
        { name: "Bacon", price: 900, type: "topping" },
        { name: "Virsli", price: 450, type: "topping" },
        { name: "Rák", price: 1300, type: "topping" },
        { name: "Szardínia", price: 700, type: "topping" },
        { name: "Tonhal", price: 700, type: "topping" },
        { name: "Tenger gyümölcsei", price: 1300, type: "topping" },
        { name: "Ananász", price: 450, type: "topping" },
        { name: "Bab", price: 450, type: "topping" },
        { name: "Brokkoli", price: 450, type: "topping" },
        { name: "Csemegeuborka", price: 450, type: "topping" },
        { name: "Fokhagymakrém", price: 250, type: "topping" },
        { name: "Gomba", price: 500, type: "topping" },
        { name: "Hagyma", price: 350, type: "topping" },
        { name: "Kukorica", price: 400, type: "topping" },
        { name: "Oliva", price: 500, type: "topping" },
        { name: "Paprika", price: 500, type: "topping" },
        { name: "Paradicsom", price: 500, type: "topping" },
        { name: "Savanyú káposzta", price: 400, type: "topping" },
        { name: "Zöldborsó", price: 350, type: "topping" },
        { name: "Tejföl", price: 400, type: "topping" },
        { name: "Tojás", price: 200, type: "topping" },
        { name: "Erős Pistás alap", price: 400, type: "topping" },

        // Sides
        { name: "Ketchup", price: 300, type: "side" },
        { name: "Majonéz", price: 300, type: "side" },
        { name: "Fokhagymás tejfölös mártás", price: 400, type: "side" },

        // Sizes
        { name: "Kicsi", price: 0, type: "size" },
        { name: "Közepes", price: 300, type: "size" },
        { name: "Nagy", price: 600, type: "size" },
        { name: "Családi", price: 2000, type: "size" },
    ],

    items: [
        {
            name: "Kukoricás",
            description: "Paradicsomos alap, sajt, sonka, kukorica",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226422/kukoricas_qijcgr.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Milánói",
            description: "Paradicsomos alap, sajt, sonka, gomba",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226422/milanoi_ribxin.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Renato",
            description: "Paradicsomos alap, sajt, gomba, zöldborsó",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226421/renato_cch9f2.jpg",
            price: 2000,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Mexikói",
            description: "Paradicsomos alap, sajt, kukorica, paprika",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226421/mexikoi_emq6o5.jpg",
            price: 2000,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Bolognai",
            description: "Paradicsomos alap, sajt, darált sertéshús",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226421/bolognai_aaieiz.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Margherita",
            description: "Paradicsomos alap, sajt",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226423/margherita_japxkw.jpg",
            price: 1900,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Sonkás",
            description: "Paradicsomos alap, sajt, sonka",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226423/sonkas_oj1e37.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Nápolyi",
            description: "Sajt, fokhagymás alap",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226423/napolyi_uybixg.jpg",
            price: 1900,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Gombás",
            description: "Paradicsomos alap, sajt, gomba",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226422/gombas_ff0ys4.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Californiai",
            description: "Paradicsomos alap, sajt, sonka, kukorica, gomba, paprika",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226418/californiai_zl7bky.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Bismark",
            description: "Paradicsomos alap, sajt, szalonna, tojás",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226418/bismark_fhdjpr.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Bakonyi",
            description: "Paradicsomos alap, sajt, gomba, tejföl, szalonna",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226417/bakonyi_qt5slc.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Piedone",
            description: "Paradicsomos alap, sajt, bab, szalonna, hagyma",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226417/piedone_ft8m84.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Pékné",
            description: "Paradicsomos alap, sajt, csülök, hagyma",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226415/pekne_pmpbnw.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Pepperone",
            description: "Paradicsomos alap, sajt, csípős paprika",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226421/pepperone_xq4fyy.jpg",
            price: 2000,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Négy évszak",
            description: "Paradicsomos alap, sajt, zöldségfélék",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226421/negy_evszak_ds60mp.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Szalámis",
            description: "Paradicsomos alap, sajt, Pick szalámi, paradicsom",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226420/szalamis_izi5iu.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Tonhalas",
            description: "Paradicsomos alap, tonhal, hagyma, paradicsom",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226419/tonhalas_jifg7d.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Szardíniás",
            description: "Paradicsomos alap, sajt, szardínia, tojás, hagyma",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226419/szardinias_xdrj7e.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Kalóz",
            description: "Paradicsomos alap, sajt, rák",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226420/kaloz_eqc4op.jpg",
            price: 2500,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Négy sajtos",
            description: "Paradicsomos alap, sajt, füstölt sajt, trappista, mozzarella",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226418/negy_sajtos_q11yym.jpg",
            price: 2700,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Toros",
            description: "Paradicsomos alap, savanyú káposzta, csülök",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226416/toros_ypaop4.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Gyroszos",
            description: "Paradicsomos alap, gyros hús, paradicsom, lila hagyma, uborka, gyros szósz",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226417/gyroszos_rlo6uz.jpg",
            price: 2700,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Bőség",
            description: "Paradicsomos alap, savanyú káposzta, bab, tejföl, csülök",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226417/boseg_ku40ah.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Magyaros",
            description: "Paradicsomos alap, sajt, kolbász, szalonna, hagyma",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226414/magyaros_heglwg.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Pipi-rone",
            description: "Paradicsomos alap, sajt, csirkehús",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226414/pipi-rone_i9x2q0.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Hawaii",
            description: "Paradicsomos alap, sajt, ananász, sonka",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226413/hawaii_dtnlp6.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Piccolo Paradiso",
            description: "Paradicsomos alap, sajt, kukorica, csirkehús, ananász",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226420/piccolo_paradiso_hbw4n9.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Tenger Gyümölcse",
            description: "Paradicsomos alap, sajt, tenger gyümölcsei",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226419/tenger_gyumolcse_uqdb6i.jpg",
            price: 2500,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Székely",
            description: "Paradicsomos alap, savanyú káposzta, csirkehús",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226416/szekely_b7oyv9.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Virslis",
            description: "Mustáros alap, sajt, virsli, csemege uborka",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226414/virslis_szktx8.jpg",
            price: 2000,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Szecsuáni",
            description: "Szecsuáni alap, sajt, csirkemell",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226414/szecsuani_fozldm.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Songoku",
            description: "Paradicsomos alap, sajt, sonka, gomba, kukorica",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226416/songoku_hwgisw.jpg",
            price: 2200,
            category_name: "Pizzák",
            customizations: customList,
        },
        {
            name: "Füstös",
            description: "Paradicsomos alap, füstölt sajt, füstölt tarja",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773226413/fustos_dtoyyp.jpg",
            price: 2300,
            category_name: "Pizzák",
            customizations: customList,
        },

        {
            name: "Paradicsomos csirkés spagetti",
            description: "Spagetti paradicsomos szósszal és csirkemellkockákkal",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773228604/paradicsomos_csirkes_spagetti_snwckv.jpg",
            price: 2600,
            category_name: "Tészták",
        },
        {
            name: "Sonkás tejszínes spagetti",
            description: "Spagetti tejszínes szósszal és sonkával",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773228605/sonkas_tejszines_spagetti_ewvzsi.jpg",
            price: 2750,
            category_name: "Tészták",
        },
        {
            name: "Bolognai spagetti",
            description: "Spagetti klasszikus bolognai raguval",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773228604/bolognai_spagetti_hvgs2s.jpg",
            price: 2850,
            category_name: "Tészták",
        },
        {
            name: "Fokhagymás spagetti",
            description: "Spagetti fokhagymás, olívaolajos szósszal és zöldfűszerekkel",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773228604/fokhagymas_spagetti_fy0kn2.jpg",
            price: 2500,
            category_name: "Tészták",
        },
        {
            name: "Pestós csirkés tortellini",
            description: "Tortellini zöld pestós szósszal és pirított csirkemellkockákkal",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773228605/pestos_csirkes_tortellini_eme8qh.jpg",
            price: 2650,
            category_name: "Tészták",
        },
        {
            name: "Sajtszószos csirkés-sonkás tortellini",
            description: "Tortellini krémes sajtszósszal, csirkemellkockákkal és sonkával",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773228605/sajtszoszos_csirkes_sonkas_tortellini_qdtyid.jpg",
            price: 2650,
            category_name: "Tészták",
        },

        {
            name: "Másnapos club szendvics",
            description:
                "Pirított szendvicskenyér, gouda sajt, sonka, bacon, tükörtojás, jégsaláta, friss paradicsom, majonéz. Hasábburgonyával tálalva.",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773229149/masnapos_club_szendvics_jvq3ey.jpg",
            price: 1590,
            category_name: "Szendvicsek",
        },
        {
            name: "Csirkés-bacon club szendvics",
            description:
                "Pirított szendvicskenyér, gouda sajt, csirkefilé, bacon, paradicsom, jégsaláta, főtt tojás, mustáros szósz. Hasábburgonyával tálalva.",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773229148/csirkes-baconos_club_szendvics_ahkbvv.jpg",
            price: 1560,
            category_name: "Szendvicsek",
        },
        {
            name: "Pulykás club szendvics",
            description:
                "Pirított kenyérszeletek, dupla jégsaláta, dupla paradicsom, pulykahús, majonéz, dupla gouda sajt. Hasábburgonyával tálalva.",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773229149/pulykas_club_szendvics_xfa3ms.jpg",
            price: 1450,
            category_name: "Szendvicsek",
        },
        {
            name: "Csirkés Philadelphia szendvics",
            description:
                "Pirított szendvicskenyér, Philadelphia krémsajt, csirkefilé, rukkolasaláta, paradicsom. Hasábburgonyával tálalva.",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773229148/csirkes_philadelphia_club_szendvics_xvp0w7.jpg",
            price: 1580,
            category_name: "Szendvicsek",
        },
        {
            name: "Sonkás-bacon club szendvics",
            description:
                "Pirított szendvicskenyér, dupla jégsaláta, dupla paradicsom, bacon, sonka, majonéz, dupla gouda sajt. Hasábburgonyával tálalva.",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773229149/sonka_bacon_club_szendvics_vhhfpl.jpg",
            price: 1490,
            category_name: "Szendvicsek",
        },

        {
            name: "Coca-Cola Original",
            description: "Klasszikus Coca-Cola szénsavas üdítőital",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230227/cola_original_ar7wtc.webp",
            price: 600,
            category_name: "Üdítők",
        },
        {
            name: "Coca-Cola Light",
            description: "Cukormentes Coca-Cola üdítőital",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230226/cola_light_upmc22.webp",
            price: 600,
            category_name: "Üdítők",
        },
        {
            name: "Coca-Cola Cherry",
            description: "Cseresznye ízű Coca-Cola szénsavas üdítőital",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230221/cola_cherry_kah4sk.webp",
            price: 600,
            category_name: "Üdítők",
        },
        {
            name: "Sprite",
            description: "Citrom-lime ízű szénsavas üdítőital",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230225/sprite_maqaeo.webp",
            price: 600,
            category_name: "Üdítők",
        },
        {
            name: "Fanta",
            description: "Narancs ízű szénsavas üdítőital",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230219/fanta_i6riti.webp",
            price: 600,
            category_name: "Üdítők",
        },
        {
            name: "Evian ásványvíz",
            description: "Természetes ásványvíz",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230225/evian_jgpmcf.webp",
            price: 500,
            category_name: "Üdítők",
        },
        {
            name: "Tropicana narancslé",
            description: "100%-os narancslé",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230222/tropicana_orange_nz5sef.webp",
            price: 550,
            category_name: "Üdítők",
        },
        {
            name: "Tropicana grapefruitlé",
            description: "Frissítő grapefruitlé",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230220/tropicana_grapefruit_dojxfg.webp",
            price: 550,
            category_name: "Üdítők",
        },
        {
            name: "Tropicana eperlé",
            description: "Eper ízű gyümölcslé",
            image_url:
                "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230220/tropicana_strawberry_eylpqm.webp",
            price: 550,
            category_name: "Üdítők",
        },
    ],
};

export default dummyData;