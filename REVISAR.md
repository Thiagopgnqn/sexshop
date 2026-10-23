# REVISAR — Observaciones del Catálogo Nocturna SexShop

Este documento fue generado automáticamente por el script de importación (`npm run import:catalog`) a partir de `catalogo_nocturna.csv`.

## Resumen General de Importación

- **Filas totales procesadas en el CSV:** 400
- **Productos únicos (agrupados por columna `grupo`):** 298
- **Filas con `estado = revisar` (cargadas como borrador / inactivas):** 29
- **Filas sin precio (`precio_ars` vacío, cargadas como inactivas):** 4
- **SKUs duplicados renombrados con sufijo único:** 12
- **SKUs vacíos completados con código interno (`NOC-XXXX`):** 64

---

## 1. Filas con `estado = revisar` (Cargadas como Borrador / Inactivas)

| Fila | Grupo / Producto | Variante / Nombre | Categoría | SKU Asignado | Precio | Nota del Catálogo |
|------|------------------|-------------------|-----------|--------------|--------|-------------------|
| 5 | Baby Doll microtul con puntilla | Baby Doll microtul con puntilla (218) | Lencería > Baby dolls | `218` | $26.000 | En el catálogo falta el nombre del Art.218 |
| 19 | Baby Doll XL | Baby Doll XL | Lencería > Baby dolls | `NOC-0006` | $28.000 | Línea talle XL sin modelo ni código |
| 37 | Body Scarlet | Body Scarlet | Lencería > Bodys | `104` | SIN PRECIO | Precio ilegible en el catálogo |
| 63 | Conjunto de red con elástico fantasía | Conjunto de red con elástico fantasía | Lencería > Conjuntos | `143` | $20.000 | Nombre inferido del texto del catálogo; confirmar |
| 100 | Body Stocking | Body Stocking (modelo 1) | Lencería > Ligueros, arneses y máscaras | `NOC-0017` | $15.000 | En el catálogo faltan nombres y códigos de los Body Stocking |
| 101 | Body Stocking | Body Stocking (modelo 2) | Lencería > Ligueros, arneses y máscaras | `NOC-0018` | $15.000 | Idem |
| 102 | Body Stocking | Body Stocking XL | Lencería > Ligueros, arneses y máscaras | `NOC-0019` | $16.000 | Idem |
| 103 | Medias de red con puntilla | Medias de red con puntilla | Lencería > Medias y accesorios | `609` | $20.000 | El catálogo dice "Art.60 9": se asume 609 |
| 109 | Accesorio sin nombre (Art.606) | Accesorio sin nombre (Art.606) | Lencería > Medias y accesorios | `606` | $14.000 | En el catálogo falta el nombre |
| 120 | Tanga Less fantasía Mayordomo | Tanga Less fantasía Mayordomo | Línea masculina | `NOC-0020` | SIN PRECIO | Sin código ni precio en el catálogo |
| 137 | Fantasía Colegiala Queen | Fantasía Colegiala Queen | Fantasías > Línea Queen | `Q103` | $39.000 | Nombre de Q103 inferido (Colegiala); confirmar |
| 222 | Gel íntimo Diva's Secret | Gel íntimo Diva's Secret | Cosmética íntima > Geles y lubricantes | `DVS02` | $12.000 | Código inferido por el orden del catálogo; confirmar |
| 226 | Wet Gel lubricante | Wet Gel lubricante | Cosmética íntima > Geles y lubricantes | `WET04` | $12.000 | Código inferido por el orden del catálogo; confirmar |
| 237 | Aceite comestible Love Potion | Aceite comestible Love Potion | Cosmética íntima > Aceites comestibles y de masaje | `A26` | $13.000 | Código A26 inferido para Frutilla; confirmar |
| 256 | Vela de masaje 30 g | Vela de masaje 30 g | Cosmética íntima > Velas y cremas de masaje | `NOC-0034` | $12.000 | Sin código ni precio propio en el catálogo; precio asumido igual al resto |
| 263 | HEROE Pro-Long Extra Time spray masculino | HEROE Pro-Long Extra Time spray masculino | Cosmética íntima > Estimulantes y retardantes | `NOC-0040` | $14.000 | Precio inferido de línea suelta; confirmar |
| 268 | Pouch Crema intensificante Black Dragon (sachet) | Pouch Crema intensificante Black Dragon (sachet) | Cosmética íntima > Estimulantes y retardantes | `PBD01` | $4.500 | Nombre inferido por el orden del catálogo; confirmar |
| 271 | The Willd Boys | The Willd Boys | Cosmética íntima > Estimulantes y retardantes | `NOC-0041` | $22.000 | Producto sin descripción en el catálogo |
| 272 | The Willd Boys Vigor | The Willd Boys Vigor | Cosmética íntima > Estimulantes y retardantes | `NOC-0042` | $22.000 | Producto sin descripción en el catálogo |
| 273 | Dante al Diablo | Dante al Diablo | Cosmética íntima > Estimulantes y retardantes | `NOC-0043` | $23.000 | Producto sin descripción en el catálogo |
| 283 | Perfume con feromonas For Him | Perfume con feromonas For Him | Perfumes y feromonas > Perfumes | `FH02` | $37.000 | Nombre inferido del catálogo; confirmar |
| 298 | Loción masculina Aphrodisiac | Loción masculina Aphrodisiac | Perfumes y feromonas > Lociones y body splash | `LJC` | $25.000 | Código y precio inferidos por el orden del catálogo; confirmar |
| 301 | Body Splash Aphrodisiac | Body Splash Aphrodisiac | Perfumes y feromonas > Lociones y body splash | `D18` | $16.000 | Código inferido por el orden del catálogo |
| 305 | Body Splash Aphrodisiac | Body Splash Aphrodisiac | Perfumes y feromonas > Lociones y body splash | `NOC-0048` | $16.000 | Precio asumido igual al resto; confirmar |
| 325 | Sex Time Game (dado con posiciones + reloj de arena) | Sex Time Game (dado con posiciones + reloj de arena) | Juegos > Dados y cartas | `STG01` | $14.000 | Nombre inferido por el código; confirmar |
| 326 | Juego Verdad o Desafío (80 cartas + 1 dado) | Juego Verdad o Desafío (80 cartas + 1 dado) | Juegos > Dados y cartas | `NOC-0056` | SIN PRECIO | Sin precio en el catálogo |
| 327 | Juego LKL (nombre faltante) | Juego LKL (nombre faltante) | Juegos > Dados y cartas | `LKL` | $10.000 | En el catálogo falta el nombre |
| 328 | Love Kit 02: lazo de ojos + dados de juego | Love Kit 02: lazo de ojos + dados de juego | Juegos > Dados y cartas | `NOC-0057` | SIN PRECIO | Sin precio en el catálogo |
| 331 | Llavero | Llavero | Juegos > Juegos de mesa y otros | `NOC-0059` | $4.000 | Sin descripción en el catálogo |

---

## 2. Filas sin Precio (`precio_ars` vacío — Cargadas como Inactivas)

| Fila | Grupo / Producto | Nombre | Categoría | SKU Asignado | Estado CSV | Nota |
|------|------------------|--------|-----------|--------------|------------|------|
| 37 | Body Scarlet | Body Scarlet | Lencería > Bodys | `104` | revisar | Precio ilegible en el catálogo |
| 120 | Tanga Less fantasía Mayordomo | Tanga Less fantasía Mayordomo | Línea masculina | `NOC-0020` | revisar | Sin código ni precio en el catálogo |
| 326 | Juego Verdad o Desafío (80 cartas + 1 dado) | Juego Verdad o Desafío (80 cartas + 1 dado) | Juegos > Dados y cartas | `NOC-0056` | revisar | Sin precio en el catálogo |
| 328 | Love Kit 02: lazo de ojos + dados de juego | Love Kit 02: lazo de ojos + dados de juego | Juegos > Dados y cartas | `NOC-0057` | revisar | Sin precio en el catálogo |

---

## 3. SKUs Duplicados en el Catálogo (Sufijos Aplicados)

Se detectaron códigos repetidos entre distintos productos del proveedor (`144`, `138`, `153`, `109`, `C02`, además de los casos observados `407` y `D659`). Se les asignó un sufijo único para mantener la integridad de la base de datos:

| Fila | SKU Original | SKU Único Asignado | Producto / Grupo | Categoría | Observación |
|------|--------------|--------------------|------------------|-----------|-------------|
| 36 | `144` | `144-1` | Body Red con puntilla | Lencería > Bodys | SKU 144 repetido con Body Leo |
| 39 | `138` | `138-1` | Body Lorena | Lencería > Bodys | SKU 138 repetido con Arnés Esposas |
| 46 | `153` | `153-1` | Body Mar | Lencería > Bodys | SKU 153 repetido con Medias de red c/puntilla y silicona |
| 47 | `144` | `144-2` | Body Leo | Lencería > Bodys | SKU 144 repetido con Body Red con puntilla |
| 80 | `109` | `109-1` | Less en V | Lencería > Tangas y lesses | SKU 109 repetido con Portaligas 109 |
| 88 | `407` | `407` | Culote Tiras | Lencería > Culotes y castigadoras | SKU 407 repetido con un dilatador anal |
| 94 | `138` | `138-2` | Arnés Esposas | Lencería > Ligueros, arneses y máscaras | SKU 138 repetido con Body Lorena |
| 99 | `109` | `109-2` | Portaligas (modelo 109) | Lencería > Ligueros, arneses y máscaras | SKU 109 repetido con Less en V |
| 105 | `153` | `153-2` | Medias de red con puntilla y silicona | Lencería > Medias y accesorios | SKU 153 repetido con Body Mar |
| 249 | `D659-MYHEMP` | `D659-MYHEMP` | Vela de masaje 30 g | Cosmética íntima > Velas y cremas de masaje | Código D659 repetido con Frutos Rojos |
| 280 | `C02` | `C02-1` | Perfume Hot Inevitable | Perfumes y feromonas > Perfumes | SKU C02 repetido con Body Splash Hot Inevitable |
| 304 | `C02` | `C02-2` | Body Splash Aphrodisiac | Perfumes y feromonas > Lociones y body splash | SKU C02 repetido con Perfume Hot Inevitable |

---

## 4. Productos sin SKU de Proveedor (Código Interno `NOC-XXXX` Generado)

| Fila | SKU Generado | Grupo | Nombre | Categoría | Nota |
|------|--------------|-------|--------|-----------|------|
| 13 | `NOC-0001` | Baby Doll Lulu | Baby Doll Lulu | Lencería > Baby dolls | Sin código en el catálogo original |
| 14 | `NOC-0002` | Baby Doll Jasmin | Baby Doll Jasmin | Lencería > Baby dolls | Sin código en el catálogo original |
| 15 | `NOC-0003` | Baby Doll Angie | Baby Doll Angie | Lencería > Baby dolls | Sin código en el catálogo original |
| 16 | `NOC-0004` | Baby Doll Aylen | Baby Doll Aylen | Lencería > Baby dolls | Sin código en el catálogo original |
| 17 | `NOC-0005` | Baby Doll Juls | Baby Doll Juls | Lencería > Baby dolls | Sin código en el catálogo original |
| 19 | `NOC-0006` | Baby Doll XL | Baby Doll XL | Lencería > Baby dolls | Línea talle XL sin modelo ni código |
| 50 | `NOC-0007` | Body Puntilla XL | Body Puntilla XL | Lencería > Bodys | Talle XL, sin código |
| 58 | `NOC-0008` | Conjunto Lorens | Conjunto Lorens | Lencería > Conjuntos | Sin código en el catálogo original |
| 62 | `NOC-0009` | Conjunto de red con tachas | Conjunto de red con tachas | Lencería > Conjuntos | Sin código en el catálogo original |
| 69 | `NOC-0010` | Less Argentina | Less Argentina | Lencería > Tangas y lesses | Sin código en el catálogo original |
| 71 | `NOC-0011` | Tanga Argolla | Tanga Argolla | Lencería > Tangas y lesses | Sin código en el catálogo original |
| 75 | `NOC-0012` | Tanga Zorra con dije | Tanga Zorra con dije | Lencería > Tangas y lesses | El catálogo dice código "11" (posible error de tipeo) |
| 76 | `NOC-0013` | Tanga Sexy con dije | Tanga Sexy con dije | Lencería > Tangas y lesses | Sin código en el catálogo original |
| 77 | `NOC-0014` | Tanga Putita con dije | Tanga Putita con dije | Lencería > Tangas y lesses | Sin código en el catálogo original |
| 78 | `NOC-0015` | Tanga Toxy con dije | Tanga Toxy con dije | Lencería > Tangas y lesses | Sin código en el catálogo original |
| 91 | `NOC-0016` | Portaligas Tull | Portaligas Tull | Lencería > Ligueros, arneses y máscaras | Sin código en el catálogo original |
| 100 | `NOC-0017` | Body Stocking | Body Stocking (modelo 1) | Lencería > Ligueros, arneses y máscaras | En el catálogo faltan nombres y códigos de los Body Stocking |
| 101 | `NOC-0018` | Body Stocking | Body Stocking (modelo 2) | Lencería > Ligueros, arneses y máscaras | Idem |
| 102 | `NOC-0019` | Body Stocking | Body Stocking XL | Lencería > Ligueros, arneses y máscaras | Idem |
| 120 | `NOC-0020` | Tanga Less fantasía Mayordomo | Tanga Less fantasía Mayordomo | Línea masculina | Sin código ni precio en el catálogo |
| 132 | `NOC-0021` | Fantasía Reina de Corazones Pasionel | Fantasía Reina de Corazones Pasionel | Fantasías > Línea Pasionel | Sin código en el catálogo original |
| 133 | `NOC-0022` | Fantasía Vampiresa Pasionel | Fantasía Vampiresa Pasionel | Fantasías > Línea Pasionel | Sin código en el catálogo original |
| 207 | `NOC-0023` | Gel Plus efecto calor | Gel Plus efecto calor | Cosmética íntima > Geles y lubricantes | Sabores listados en una sola línea del catálogo |
| 208 | `NOC-0024` | Gel Plus efecto calor | Gel Plus efecto calor | Cosmética íntima > Geles y lubricantes | Sabores listados en una sola línea del catálogo |
| 209 | `NOC-0025` | Gel Plus efecto calor | Gel Plus efecto calor | Cosmética íntima > Geles y lubricantes | Sabores listados en una sola línea del catálogo |
| 210 | `NOC-0026` | Gel Plus efecto calor | Gel Plus efecto calor | Cosmética íntima > Geles y lubricantes | Sabores listados en una sola línea del catálogo |
| 229 | `NOC-0027` | Aceite Kamasutra saborizado | Aceite Kamasutra saborizado | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 230 | `NOC-0028` | Aceite Kamasutra saborizado | Aceite Kamasutra saborizado | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 231 | `NOC-0029` | Aceite Kamasutra saborizado | Aceite Kamasutra saborizado | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 232 | `NOC-0030` | Aceite Kamasutra saborizado | Aceite Kamasutra saborizado | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 233 | `NOC-0031` | Aceite Kamasutra saborizado | Aceite Kamasutra saborizado | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 234 | `NOC-0032` | Aceite Kamasutra saborizado | Aceite Kamasutra saborizado | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 243 | `NOC-0033` | Aceite para masajes SensBomb efecto calor | Aceite para masajes SensBomb efecto calor | Cosmética íntima > Aceites comestibles y de masaje | Sin código en el catálogo original |
| 256 | `NOC-0034` | Vela de masaje 30 g | Vela de masaje 30 g | Cosmética íntima > Velas y cremas de masaje | Sin código ni precio propio en el catálogo; precio asumido igual al resto |
| 257 | `NOC-0035` | Crema corporal para masaje | Crema corporal para masaje | Cosmética íntima > Velas y cremas de masaje | Sin código en el catálogo original |
| 258 | `NOC-0036` | Crema corporal para masaje | Crema corporal para masaje | Cosmética íntima > Velas y cremas de masaje | Sin código en el catálogo original |
| 259 | `NOC-0037` | Línea Sexitive Lichang x4 | Línea Sexitive Lichang x4 | Cosmética íntima > Estimulantes y retardantes | Sin código en el catálogo original |
| 260 | `NOC-0038` | Miel Vital Honey (por sobre) | Miel Vital Honey (por sobre) | Cosmética íntima > Estimulantes y retardantes | Sin código en el catálogo original |
| 262 | `NOC-0039` | HEROE Performance spray masculino | HEROE Performance spray masculino | Cosmética íntima > Estimulantes y retardantes | Sin código en el catálogo original |
| 263 | `NOC-0040` | HEROE Pro-Long Extra Time spray masculino | HEROE Pro-Long Extra Time spray masculino | Cosmética íntima > Estimulantes y retardantes | Precio inferido de línea suelta; confirmar |
| 271 | `NOC-0041` | The Willd Boys | The Willd Boys | Cosmética íntima > Estimulantes y retardantes | Producto sin descripción en el catálogo |
| 272 | `NOC-0042` | The Willd Boys Vigor | The Willd Boys Vigor | Cosmética íntima > Estimulantes y retardantes | Producto sin descripción en el catálogo |
| 273 | `NOC-0043` | Dante al Diablo | Dante al Diablo | Cosmética íntima > Estimulantes y retardantes | Producto sin descripción en el catálogo |
| 276 | `NOC-0044` | Pink Sexy Drops | Pink Sexy Drops | Cosmética íntima > Estimulantes y retardantes | Sin código en el catálogo original |
| 277 | `NOC-0045` | Blue Sexy Drops | Blue Sexy Drops | Cosmética íntima > Estimulantes y retardantes | Sin código en el catálogo original |
| 288 | `NOC-0046` | Ambus Feromonas | Ambus Feromonas | Perfumes y feromonas > Perfumes | Sin código en el catálogo original |
| 289 | `NOC-0047` | Bali Sunset Stripped | Bali Sunset Stripped | Perfumes y feromonas > Perfumes | Sin código en el catálogo original |
| 305 | `NOC-0048` | Body Splash Aphrodisiac | Body Splash Aphrodisiac | Perfumes y feromonas > Lociones y body splash | Precio asumido igual al resto; confirmar |
| 306 | `NOC-0049` | Perfume Aphrodisiac aceite concentrado roll on | Perfume Aphrodisiac aceite concentrado roll on | Perfumes y feromonas > Aceites roll on | Precio tomado de líneas sueltas del catálogo |
| 307 | `NOC-0050` | Perfume Aphrodisiac aceite concentrado roll on | Perfume Aphrodisiac aceite concentrado roll on | Perfumes y feromonas > Aceites roll on | Precio tomado de líneas sueltas del catálogo |
| 315 | `NOC-0051` | Naipe Kamasutra | Naipe Kamasutra | Juegos > Dados y cartas | Sin código en el catálogo original |
| 320 | `NOC-0052` | Juego de cartas "Let's Fuck" + dados | Juego de cartas "Let's Fuck" + dados | Juegos > Dados y cartas | Sin código en el catálogo original |
| 321 | `NOC-0053` | Juego de cartas Les Amants + dados | Juego de cartas Les Amants + dados | Juegos > Dados y cartas | Sin código en el catálogo original |
| 323 | `NOC-0054` | Love Play dados de juego | Love Play dados de juego | Juegos > Dados y cartas | Sin código en el catálogo original |
| 324 | `NOC-0055` | Inlube Game Gel + dados | Inlube Game Gel + dados | Juegos > Dados y cartas | Sin código en el catálogo original |
| 326 | `NOC-0056` | Juego Verdad o Desafío (80 cartas + 1 dado) | Juego Verdad o Desafío (80 cartas + 1 dado) | Juegos > Dados y cartas | Sin precio en el catálogo |
| 328 | `NOC-0057` | Love Kit 02: lazo de ojos + dados de juego | Love Kit 02: lazo de ojos + dados de juego | Juegos > Dados y cartas | Sin precio en el catálogo |
| 330 | `NOC-0058` | Ruleta con pulsador | Ruleta con pulsador | Juegos > Juegos de mesa y otros | Sin código en el catálogo original |
| 331 | `NOC-0059` | Llavero | Llavero | Juegos > Juegos de mesa y otros | Sin descripción en el catálogo |
| 332 | `NOC-0060` | Llavero Pitosaurio | Llavero Pitosaurio | Juegos > Juegos de mesa y otros | Sin código en el catálogo original |
| 350 | `NOC-0061` | Esposas | Esposas | BDSM y arneses > Esposas | Sin código en el catálogo original |
| 351 | `NOC-0062` | Esposas | Esposas | BDSM y arneses > Esposas | Sin código en el catálogo original |
| 357 | `NOC-0063` | Kit negro | Kit negro | BDSM y arneses > Kits y accesorios | Sin código en el catálogo original |
| 359 | `NOC-0064` | Inmovilizador cuello-manos | Inmovilizador cuello-manos | BDSM y arneses > Kits y accesorios | Sin código en el catálogo original |

---

## 5. Otras Notas e Inferencias en Filas Activas (`estado = ok`)

Estas filas tienen precio y `estado = ok`, pero poseen observaciones en la columna `nota` para validar con el cliente:

| Fila | Producto / Variante | SKU | Nota para confirmar con el cliente |
|------|---------------------|-----|------------------------------------|
| 3 | Baby Doll microtul con puntilla (205) | `205` | Mismo nombre que 208 y 218: diferenciar con fotos |
| 4 | Baby Doll microtul con puntilla (208) | `208` | Mismo nombre que 205 y 218: diferenciar con fotos |
| 8 | Baby Doll Venecia | `4580` | Descripción tomada de la nota del catálogo (inferida para este grupo) |
| 9 | Baby Doll Milan | `4590` | Descripción tomada de la nota del catálogo (inferida para este grupo) |
| 10 | Baby Doll Lyon | `4600` | Descripción tomada de la nota del catálogo (inferida para este grupo) |
| 11 | Baby Doll Atenas | `4414` | Descripción tomada de la nota del catálogo (inferida para este grupo) |
| 12 | Baby Doll Dublin | `4445` | Descripción tomada de la nota del catálogo (inferida para este grupo) |
| 36 | Body Red con puntilla | `144-1` | SKU 144 repetido con Body Leo |
| 39 | Body Lorena | `138-1` | SKU 138 repetido con Arnés Esposas |
| 46 | Body Mar | `153-1` | SKU 153 repetido con Medias de red c/puntilla y silicona |
| 47 | Body Leo | `144-2` | SKU 144 repetido con Body Red con puntilla |
| 50 | Body Puntilla XL | `NOC-0007` | Talle XL, sin código |
| 75 | Tanga Zorra con dije | `NOC-0012` | El catálogo dice código "11" (posible error de tipeo) |
| 80 | Less en V | `109-1` | SKU 109 repetido con Portaligas 109 |
| 88 | Culote Tiras | `407` | SKU 407 repetido con un dilatador anal |
| 94 | Arnés Esposas | `138-2` | SKU 138 repetido con Body Lorena |
| 99 | Portaligas (modelo 109) | `109-2` | SKU 109 repetido con Less en V |
| 105 | Medias de red con puntilla y silicona | `153-2` | SKU 153 repetido con Body Mar |
| 136 | Fantasía Enfermera Queen | `Q102` | Confirmar si Queen es línea talle grande |
| 138 | Fantasía Conejita Queen | `Q112` | Confirmar si Queen es línea talle grande |
| 139 | Fantasía Mucamita Queen | `Q115` | Confirmar si Queen es línea talle grande |
| 140 | Fantasía Policía Queen | `Q116` | Confirmar si Queen es línea talle grande |
| 141 | Fantasía Diablita Queen | `Q128` | Confirmar si Queen es línea talle grande |
| 142 | Fantasía Coneja Enlace | `E407` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 143 | Fantasía Colegiala Enlace | `E406` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 144 | Fantasía Enfermera Enlace | `E404` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 145 | Fantasía Policía Enlace | `E400` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 146 | Fantasía Diabla Enlace | `E410` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 147 | Fantasía Mucama Tull | `E411` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 148 | Fantasía Mucama Enlace | `E412` | En el catálogo el título dice "FREE TAX LINE" (probable Free Size); confirmar |
| 156 | Fantasía Enfermera FT Negra | `FT.02-NEGRA` | SKU derivado del código + color |
| 157 | Fantasía Enfermera FT Roja | `FT.02-ROJA` | SKU derivado del código + color |
| 158 | Fantasía Enfermera FT | `FT.02` | SKU derivado del código + color |
| 159 | Fantasía Colegiala FT Negra | `FT.03-NEGRA` | SKU derivado del código + color |
| 160 | Fantasía Colegiala FT Blanca | `FT.03-BLANCA` | SKU derivado del código + color |
| 161 | Fantasía Coneja FT Rosa | `FT.12-ROSA` | SKU derivado del código + color |
| 162 | Fantasía Coneja FT | `FT.12` | SKU derivado del código + color |
| 163 | Fantasía Gatita FT Leopardo | `FT.13-LEOPARDO` | SKU derivado del código + color |
| 164 | Fantasía Gatita FT | `FT.13` | SKU derivado del código + color |
| 165 | Fantasía Mucama FT Rosa | `FT.15-ROSA` | SKU derivado del código + color |
| 166 | Fantasía Mucama FT | `FT.15` | SKU derivado del código + color |
| 167 | Fantasía Marinera FT Negra | `FT.11-NEGRA` | SKU derivado del código + color |
| 168 | Fantasía Marinera FT Celeste | `FT.11-CELESTE` | SKU derivado del código + color |
| 207 | Gel Plus efecto calor | `NOC-0023` | Sabores listados en una sola línea del catálogo |
| 208 | Gel Plus efecto calor | `NOC-0024` | Sabores listados en una sola línea del catálogo |
| 209 | Gel Plus efecto calor | `NOC-0025` | Sabores listados en una sola línea del catálogo |
| 210 | Gel Plus efecto calor | `NOC-0026` | Sabores listados en una sola línea del catálogo |
| 249 | Vela de masaje 30 g | `D659-MYHEMP` | Código D659 repetido con Frutos Rojos |
| 280 | Perfume Hot Inevitable | `C02-1` | SKU C02 repetido con Body Splash Hot Inevitable |
| 304 | Body Splash Aphrodisiac | `C02-2` | SKU C02 repetido con Perfume Hot Inevitable |
| 306 | Perfume Aphrodisiac aceite concentrado roll on | `NOC-0049` | Precio tomado de líneas sueltas del catálogo |
| 307 | Perfume Aphrodisiac aceite concentrado roll on | `NOC-0050` | Precio tomado de líneas sueltas del catálogo |
| 362 | Estaca Anal XL | `402-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 363 | Estaca Anal XL | `402-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 364 | Escorpión | `403-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 365 | Escorpión | `403-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 366 | Conquistador Anal | `404-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 367 | Conquistador Anal | `404-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 368 | Invasor Anal | `405-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 369 | Invasor Anal | `405-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 370 | Inexpulsable | `406-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 371 | Inexpulsable | `406-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 372 | Personal Trainer | `407-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 373 | Personal Trainer | `407-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 374 | Varita Anal | `408` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 375 | Slim Jim | `409-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 376 | Slim Jim | `409-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 377 | Benjamin | `410-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 378 | Benjamin | `410-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 379 | Anal Cliterific | `411-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 380 | Anal Cliterific | `411-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 381 | Tornado | `412-C` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 382 | Tornado | `412-V` | Interpretación del formato del catálogo (Consolador / Vibrador); confirmar con el cliente |
| 384 | Safary | `421` | SCV: sigla del catálogo, confirmar significado |
| 385 | Safary | `422` | SCV: sigla del catálogo, confirmar significado |
| 387 | Tres Sensaciones | `431` | SCV: sigla del catálogo, confirmar significado |
| 388 | Tres Sensaciones | `432` | SCV: sigla del catálogo, confirmar significado |
| 396 | Doble Lesbian 44 cm | `707V` | Variante Vertical/Vibro interpretada como vibrador; confirmar |
| 398 | Doble Anal 32 cm | `706V` | Variante Vertical/Vibro interpretada como vibrador; confirmar |
| 400 | Doble Lesbian chico 33 cm | `708` | Variante Vertical/Vibro interpretada como vibrador; confirmar |
