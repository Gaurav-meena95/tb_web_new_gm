function renderEmojis() {
	// emojis = [
	// 	"😀",
	// 	"😁",
	// 	"😂",
	// 	"🤣",
	// 	"😃",
	// 	"😄",
	// 	"😅",
	// 	"😆",
	// 	"😉",
	// 	"😊",
	
	
	// 	"😋",
	// 	"😎",
	// 	"😍",
	// 	"😘",
	// 	"🥰",
	// 	"😗",
	// 	"😙",
	// 	"😚",
	// 	"🙂",
	// 	"🤗",
	// 	"🤩",
	// 	"🤔",
	// 	"🤨",
	// 	"😐",
	// 	"😑",
	// 	"😶",
	// 	"🙄",
	// 	"😏",
	// 	"😣",
	// 	"😥",
	// 	"😮",
	// 	"🤐",
	// 	"😯",
	// 	"😪",
	// 	"😫",
	// 	"🥱",
	// 	"😴",
	// 	"😌",
	// 	"😛",
	// 	"😜",
	// 	"😝",
	// 	"🤤",
	// 	"😒",
	// 	"😓",
	// 	"😔",
	// 	"😕",
	// 	"🙃",
	// 	"🤑",
	// 	"😲",
	// 	"☹️",
	// 	"🙁",
	// 	"😖",
	// 	"😞",
	// 	"😟",
	// 	"😤",
	// 	"😢",
	// 	"😭",
	// 	"😦",
	// 	"😧",
	// 	"😨",
	// 	"😩",
	// 	"🤯",
	// 	"😬",
	// 	"😰",
	// 	"😱",
	// 	"🥵",
	// 	"🥶",
	// 	"😳",
	// 	"🤪",
	// 	"😵",
	// 	"🤕",
	// 	"🤢",
	// 	"🤮",
	// 	"🤧",
	// 	"😷",
	// 	"🤒",
	// 	"🤠",
	// 	"👽",
	// 	"👾",
	// 	"🤖",
	// 	"🎃",
	// 	"😺",
	// 	"😸",
	// 	"😹",
	// 	"😻",
	// 	"😼",
	// 	"😽",
	// 	"🙀",
	// 	"😿",
	// 	"😾",
	// 	"👋",
	// 	"🤚",
	// 	"🖐",
	// 	"✋",
	// 	"🖖",
	// 	"👌",
	// 	"🤏",
	// 	"✌️",
	// 	"🤞",
	// 	"🤟",
	// 	"🤘",
	// 	"🤙",
	// 	"👈",
	// 	"👉",
	// 	"👆",
	// 	"🖕",
	// 	"👇",
	// 	"☝️",
	// 	"👍",
	// 	"👎",
	// 	"✊",
	// 	"👊",
	// 	"🤛",
	// 	"🤜",
	// 	"👏",
	// 	"🙌",
	// 	"👐",
	// 	"🤲",
	// 	"🤝",
	// 	"🙏",
	// 	"💅",
	// 	"🤳",
	// 	"💪",
	// 	"🦾",
	// 	"🦵",
	// 	"🦿",
	// 	"🦶",
	// 	"👣",
	// 	"👂",
	// 	"🦻",
	// 	"👃",
	// 	"🧠",
	// 	"🦷",
	// 	"🦴",
	// 	"👀",
	// 	"👁",
	// 	"👅",
	// 	"👄",
	// 	"💋",
	// 	"🩸",
	// ];

	emojis = [
		// Smileys
		"😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "🤕", "🤢", "🤮", "🤧", "😷", "🤒", "🤠",
		// People
		"👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳‍♂️", "🧕", "🧔", "👱‍♂️", "👱‍♀️", "👨‍🦰", "👩‍🦰", "👨‍🦱", "👩‍🦱", "👨‍🦲", "👩‍🦲", "👨‍🦳", "👩‍🦳", "👮‍♀️", "👮‍♂️", "👷‍♀️", "👷‍♂️", "💂‍♀️", "💂‍♂️", "🕵️‍♀️", "🕵️‍♂️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🎓", "👨‍🎓", "👩‍🎤", "👨‍🎤", "👩‍🏫", "👨‍🏫", "👩‍🏭", "👨‍🏭", "👩‍💻", "👨‍💻", "👩‍💼", "👨‍💼", "👩‍🔧", "👨‍🔧", "👩‍🔬", "👨‍🔬", "👩‍🎨", "👨‍🎨", "👩‍🚒", "👨‍🚒", "👩‍✈️", "👨‍✈️", "👩‍🚀", "👨‍🚀", "👩‍⚖️", "👨‍⚖️", "👰", "🤵", "👸", "🤴", "🦸‍♀️", "🦸‍♂️", "🦹‍♀️", "🦹‍♂️", "🤶", "🎅", "🧙‍♀️", "🧙‍♂️", "🧝‍♀️", "🧝‍♂️", "🧛‍♀️", "🧛‍♂️", "🧟‍♀️", "🧟‍♂️", "🧞‍♀️", "🧞‍♂️", "🧜‍♀️", "🧜‍♂️", "🧚‍♀️", "🧚‍♂️", "👼", "🤰", "🤱", "🙇‍♀️", "🙇‍♂️", "💁‍♀️", "💁‍♂️", "🙅‍♀️", "🙅‍♂️", "🙆‍♀️", "🙆‍♂️", "🙋‍♀️", "🙋‍♂️", "🤦‍♀️", "🤦‍♂️", "🤷‍♀️", "🤷‍♂️", "🙎‍♀️", "🙎‍♂️", "🙍‍♀️", "🙍‍♂️", "💇‍♀️", "💇‍♂️", "💆‍♀️", "💆‍♂️", "🧖‍♀️", "🧖‍♂️", "💅", "🤳", "💃", "🕺", "👯‍♀️", "👯‍♂️", "🕴", "🚶‍♀️", "🚶‍♂️", "🏃‍♀️", "🏃‍♂️", "🧍‍♀️", "🧍‍♂️", "🧎‍♀️", "🧎‍♂️", "👨‍🦯", "👩‍🦯", "👨‍🦼", "👩‍🦼", "👨‍🦽", "👩‍🦽", "🧑‍🤝‍🧑", "👫", "👭", "👬", "💏", "👨‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", "💑", "👨‍❤️‍👨", "👩‍❤️‍👩", "👪", "👨‍👩‍👦", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👨‍👨‍👦", "👨‍👨‍👧", "👨‍👨‍👧‍👦", "👨‍👨‍👦‍👦", "👨‍👨‍👧‍👧", "👩‍👩‍👦", "👩‍👩‍👧", "👩‍👩‍👧‍👦", "👩‍👩‍👦‍👦", "👩‍👩‍👧‍👧", "👨‍👦", "👨‍👦‍👦", "👨‍👧", "👨‍👧‍👦", "👨‍👧‍👧", "👩‍👦", "👩‍👦‍👦", "👩‍👧", "👩‍👧‍👦", "👩‍👧‍👧", "🗣", "👤", "👥", "👣",
		// Animals & Nature
		"🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿", "🦔", "🐾", "🐉", "🐲", "🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", "🍀", "🎍", "🎋", "🍃", "🍂", "🍁", "🍄", "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌎", "🌍", "🌏", "🪐", "💫", "⭐️", "🌟", "✨", "⚡️", "☄️", "💥", "🔥", "🌪", "🌈", "☀️", "🌤", "⛅️", "🌥", "☁️", "🌦", "🌧", "⛈", "🌩", "🌨", "❄️", "☃️", "⛄️", "🌬", "💨", "💧", "💦", "☔️", "☂️", "🌊", "🌫",
		// Food & Drink
		"🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕️", "🍵", "🧃", "🥤", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽", "🥣", "🥡", "🥢", "🧂",
		// Travel & Places
		"🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️", "🛫", "🛬", "🛩", "💺", "🛰", "🚀", "🛸", "🚁", "🛶", "⛵️", "🚤", "🛥", "🛳", "⛴", "🚢", "⚓️", "⛽️", "🚧", "🚦", "🚥", "🚏", "🗺", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟", "🎡", "🎢", "🎠", "⛲️", "⛱", "🏖", "🏝", "🏜", "🌋", "⛰", "🏔", "🗻", "🏕", "⛺️", "🏠", "🏡", "🏘", "🏚", "🏗", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛", "⛪️", "🕌", "🕍", "🛕", "🕋", "⛩", "🛤", "🛣", "🗾", "🎑", "🏞", "🌅", "🌄", "🌠", "🎇", "🎆", "🌇", "🌆", "🏙", "🌃", "🌌", "🌉", "🌁",
		// Activities
		"⚽️", "🏀", "🏈", "⚾️", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳️", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸", "🥌", "🎿", "⛷", "🏂", "🪂", "🏋️‍♀️", "🏋️‍♂️", "🤼‍♀️", "🤼‍♂️", "🤸‍♀️", "🤸‍♂️", "⛹️‍♀️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾‍♂️", "🏌️‍♀️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘‍♂️", "🏄‍♀️", "🏄‍♂️", "🏊‍♀️", "🏊‍♂️", "🤽‍♀️", "🤽‍♂️", "🚣‍♀️", "🚣‍♂️", "🧗‍♀️", "🧗‍♂️", "🚵‍♀️", "🚵‍♂️", "🚴‍♀️", "🚴‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪", "🤹‍♀️", "🤹‍♂️", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♟", "🎯", "🎳", "🎮", "🎰", "🧩",
		// Objects
		"🚬", "⚰️", "⚱️", "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳", "🩹", "🩺", "💊", "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡", "🧹", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀", "🧼", "🪒", "🧽", "🧴", "🛎", "🔑", "🗝", "🚪", "🪑", "🛋", "🛏", "🛌", "🧸", "🖼", "🛍", "🛒", "🎁", "🎈", "🎏", "🎀", "🎊", "🎉", "🎎", "🏮", "🎐", "🧧", "✉️", "📩", "📨", "📧", "💌", "📥", "📤", "📦", "🏷", "📪", "📫", "📬", "📭", "📮", "📯", "📜", "📃", "📄", "📑", "🧾", "📊", "📈", "📉", "🗒", "🗓", "📆", "📅", "🗑", "📇", "🗃", "🗳", "🗄", "📋", "📁", "📂", "🗂", "🗞", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚", "📖", "🔖", "🧷", "🔗", "📎", "🖇", "📐", "📏", "🧮", "📌", "📍", "✂️", "🖊", "🖋", "✒️", "🖌", "🖍", "📝", "✏️", "🔍", "🔎", "🔏", "🔐", "🔒", "🔓",
		// Symbols
		"❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈️", "♉️", "♊️", "♋️", "♌️", "♍️", "♎️", "♏️", "♐️", "♑️", "♒️", "♓️", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚️", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕️", "🛑", "⛔️", "📛", "🚫", "💯", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗️", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯️", "💹", "❇️", "✳️", "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿️", "🅿️", "🈳", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧", "🚻", "🚮", "🎦", "📶", "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", "▶️", "⏸", "⏯", "⏹", "⏺", "⏭", "⏮", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾", "💲", "💱", "™️", "©️", "®️", "〰️", "➰", "➿", "🔚", "🔙", "🔛", "🔝", "🔜", "✔️", "☑️", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫️", "⚪️", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔳", "🔲", "▪️", "▫️", "◾️", "◽️", "◼️", "◻️", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛️", "⬜️", "🟫", "🔈", "🔇", "🔉", "🔊", "🔔", "🔕", "📣", "📢", "👁‍🗨", "💬", "💭", "🗯", "♠️", "♣️", "♥️", "♦️", "🃏", "🎴", "🀄️", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧",
		// Flags
		"🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇫", "🇦🇽", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬", "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹", "🇧🇴", "🇧🇦", "🇧🇼", "🇧🇷", "🇮🇴", "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇰🇭", "🇨🇲", "🇨🇦", "🇮🇨", "🇨🇻", "🇧🇶", "🇰🇾", "🇨🇫", "🇹🇩", "🇨🇱", "🇨🇳", "🇨🇽", "🇨🇨", "🇨🇴", "🇰🇲", "🇨🇬", "🇨🇩", "🇨🇰", "🇨🇷", "🇨🇮", "🇭🇷", "🇨🇺", "🇨🇼", "🇨🇾", "🇨🇿", "🇩🇰", "🇩🇯", "🇩🇲", "🇩🇴", "🇪🇨", "🇪🇬", "🇸🇻", "🇬🇶", "🇪🇷", "🇪🇪", "🇪🇹", "🇪🇺", "🇫🇰", "🇫🇴", "🇫🇯", "🇫🇮", "🇫🇷", "🇬🇫", "🇵🇫", "🇹🇫", "🇬🇦", "🇬🇲", "🇬🇪", "🇩🇪", "🇬🇭", "🇬🇮", "🇬🇷", "🇬🇱", "🇬🇩", "🇬🇵", "🇬🇺", "🇬🇹", "🇬🇬", "🇬🇳", "🇬🇼", "🇬🇾", "🇭🇹", "🇭🇳", "🇭🇰", "🇭🇺", "🇮🇸", "🇮🇳", "🇮🇩", "🇮🇷", ];
	
	let emojisDiv =
		'<div id="emojiPicker-chat"><div class="emoji__type-chooser"><div class="emoji_choose active">Emoji</div><div class="gif_choose">GIFs</div><div class="sticker_choose hidden">Stickers</div></div><div id="emoji__container">';
	emojis.forEach((emoji) => {
		emojisDiv += `<div class="select__emoji-chat">${emoji}</div>`;
	});
	
	
	emojisDiv +=
		'</div><div id="gif__container" style="display:none;"></div></div>';
	
	// Add File selection as well
	let fileSelection = `<div id="filePicker-chat"><div id="file__container"><div class="select__camera-chat">Camera</div><div class="select__video-chat">Videos</div><div class="select__photo-chat">Photos</div></div></div>`
	
	emojisDiv += fileSelection;

	return emojisDiv;
}

// Tenor API integration
var apiKey = "AIzaSyBTUmwdSpcG6lSqraIG_Il_fYFI5FtHslM"; // Replace with your actual API key
var clientKey = "my_test_app";
var limit = 12;
let offset = 0;
let isLoading = false;

// Initialize GIF container with search box and trending GIFs
function initializeGifContainer() {
	var gifContainer = jQuery("#gif__container");

	// Add search box
	gifContainer.html(`
		  <div class="gif-search-container">
			  <input type="text" id="gif-search-input" placeholder="Search GIFs...">
		  </div>
		  <div class="gif-grid"></div>
		  <div class="gif-loading">Loading...</div>
	  `);

	// Style the GIF container
	jQuery("<style>")
		.prop("type", "text/css")
		.html(
			`
			  #gif__container{
				  height: 300px;
				  overflow-y: auto;
				  padding: 10px;
			  }
			  .gif-search-container {
				  margin-bottom: 10px;
			  }
			  #gif-search-input {
				  width: 100%;
				  padding: 8px;
				  border: 1px solid #ddd;
				  border-radius: 20px;
				  font-size: 14px;
			  }
			  .gif-grid {
				  display: grid;
				  grid-template-columns: repeat(2, 1fr);
				  gap: 8px;
			  }
			  .tenor-gif {
				  width: 100%;
				  border-radius: 8px;
				  cursor: pointer;
				  transition: transform 0.2s;
			  }
			  .tenor-gif:hover {
				  transform: scale(1.05);
			  }
			  .gif-loading {
				  text-align: center;
				  padding: 10px;
				  display: none;
			  }
		  `
		)
		.appendTo("head");

	// Load trending GIFs
	loadTrendingGifs();

	// Add scroll event listener for infinite scrolling
	gifContainer.on("scroll", () => {
		if (
			gifContainer.scrollTop() + gifContainer.innerHeight() >=
			gifContainer[0].scrollHeight - 50
		) {
			if (!isLoading) {
				if (jQuery("#gif-search-input").val().trim()) {
					searchGifs(jQuery("#gif-search-input").val().trim(), true);
				} else {
					loadTrendingGifs(true);
				}
			}
		}
	});
}

// Load trending GIFs
function loadTrendingGifs(append = false) {
	/*if (isLoading) return
  
	isLoading = true
	jQuery(".gif-loading").show()
  
	// Use our proxy endpoint instead of directly calling Tenor API
	var url = `/api/tenor/trending?limit=${limit}&pos=${append ? offset : 0}`
  
	fetch(url)
	  .then((response) => response.json())
	  .then((data) => {
		renderGifs(data.results, append)
		offset = append ? offset + limit : limit
		isLoading = false
		jQuery(".gif-loading").hide()
	  })
	  .catch((error) => {
		console.error("Error fetching trending GIFs:", error)
		isLoading = false
		jQuery(".gif-loading").hide()
	  })*/

	var gif = [
		"Top",
		"Featured",
		"Trending",
		"Random",
		"Hi",
		"Hello",
		"Good Morning",
		"Good Night",
		"Good Afternoon",
		"Good Evening",
		"Good Day",
		"Good Bye",
		"Bye",
		"Thank You",
		"Thanks",
		"Welcome",
		"Sorry",
		"Please",
		"Yes",
		"No",
		"Ok",
		"Okay",
		"Great",
		"Awesome",
		"Wow",
		"Haha",
		"LOL",
		"LMAO",
		"ROFL",
		"OMG",
		"WTF",
		"IDK",
		"IDC",
		"IDGAF",
		"BRB",
		"TTYL",
		"GTG",
		"BFF",
		"Bae",
		"Bestie",
		"Best Friend",
		"Friend",
		"Family",
		"Love",
		"Hate",
		"Angry",
		"Sad",
		"Happy",
		"Excited",
		"Bored",
		"Tired",
		"Sleepy",
		"Hungry",
		"Thirsty",
		"Cold",
		"Hot",
		"Sick",
		"Healthy",
		"Fit",
		"Strong",
		"Weak",
		"Lazy",
		"Active",
		"Busy",
		"Free",
		"Available",
		"Unavailable",
		"Offline",
		"Online",
		"Away",
		"Busy",
		"Do Not Disturb",
		"Invisible",
		"Visible",
		"Private",
		"Public",
		"Secret",
		"Confidential",
		"Personal",
		"Professional",
		"Official",
		"Unofficial",
		"Legal",
		"Illegal",
		"Right",
		"Wrong",
		"Correct",
		"Incorrect",
		"True",
		"False",
		"Fact",
		"Fiction",
		"Reality",
		"Dream",
		"Nightmare",
		"Daydream",
		"Daymare",
		"Daylight",
		"Moonlight",
		"Sunlight",
		"Starlight",
		"Star",
		"Moon",
		"Sun",
		"Sky",
		"Cloud",
		"Rain",
		"Rainbow",
		"Snow",
		"Storm",
		"Thunder",
		"Lightning",
		"Wind",
		"Breeze",
		"Gale",
		"Hurricane",
		"Tornado",
		"Cyclone",
		"Earthquake",
		"Volcano",
		"Tsunami",
		"Flood",
		"Drought",
		"Fire",
		"Ice",
		"Water",
		"Air",
		"Land",
		"Sea",
		"Ocean",
		"River",
		"Lake",
		"Pond",
		"Stream",
		"Waterfall",
		"Waterfront",
		"Waterway",
		"Waterworks",
		"Waterworld",
		"Watermark",
		"Watermelon",
		"Watercress",
		"Waterlily",
		"Waterfowl",
		"Waterbird",
		"Waterfall",
		"Waterfront",
		"Waterway",
		"Waterworks",
		"Waterworld",
		"Watermark",
		"Watermelon",
		"Watercress",
		"Waterlily",
		"Waterfowl",
		"Waterbird",
		"Watercolor",
		"Watercolour",
	];

	searchGifs(gif[Math.floor(Math.random() * gif.length)], append);

	return;
}

// Search GIFs
function searchGifs(query, append = false) {
	if (isLoading) return;

	isLoading = true;
	jQuery(".gif-loading").show();

	// Use our proxy endpoint instead of directly calling Tenor API
	var url = `/api/tenor/search?q=${encodeURIComponent(
		query
	)}&limit=${limit}&pos=${append ? offset : 0}`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			renderGifs(data.results, append);
			offset = append ? offset + limit : limit;
			isLoading = false;
			jQuery(".gif-loading").hide();
		})
		.catch((error) => {
			console.error("Error searching GIFs:", error);
			isLoading = false;
			jQuery(".gif-loading").hide();
		});
}

// Render GIFs to the container
function renderGifs(gifs, append = false) {
	var gifGrid = jQuery(".gif-grid");

	if (!append) {
		gifGrid.empty();
	}

	gifs.forEach((gif) => {
		var previewUrl = gif.media_formats.tinygif.url;
		var originalUrl = gif.media_formats.gif.url;

		var gifElement = jQuery("<img>")
			.addClass("tenor-gif")
			.attr("src", previewUrl)
			.attr("alt", gif.content_description)
			.data("original-url", originalUrl);

		gifGrid.append(gifElement);
	});
}

// Send a GIF message
function sendGifMessage(gifUrl, previewUrl) {
	var chatId = jQuery(".chat__input-send").data("chatId");
	var chatType = jQuery(".chat__input-send").hasClass("group")
		? "group"
		: "personal";
	var timeStamp = new Date().getTime();
	var userId =
		chatType == "personal" ? jQuery(".chat__header").data("userId") : "";

	var chatObj = {
		chatType: chatType,
		chatId: chatId,
		senderId: localStorage.getItem("plainUserId"),
		isSentByCurrentUser: true,
		timeStamp: (Number(timeStamp) / 1000).toFixed(0),
		message: gifUrl,
		userId: userId,
		type: "gif",
		previewUrl: previewUrl,
	};

	// Send the GIF message to the server
	jsInit("postChatMessage", chatObj);

	
	// Render the GIF message in the chat
	renderChatMessages(chatObj, true);
}



function returnEmojisForReaction() {
	return `<button class="chat__reaction-item">❤️</button>
				<button class="chat__reaction-item">😂</button>
				<button class="chat__reaction-item">😮</button>
				<button class="chat__reaction-item">😢</button>
				<button class="chat__reaction-item">🙏</button>
				<button class="chat__reaction-item">👎</button>
				<button class="chat__reaction-item">🔥</button>
				<button class="chat__reaction-item">💔</button>
				<button class="chat__reaction-item">💩</button>
				<button class="chat__reaction-item">😡</button>
				<button class="chat__reaction-item">😎</button>
				<button class="chat__reaction-item">🥳</button>
				<button class="chat__reaction-item">😴</button>
				<button class="chat__reaction-item">😱</button>
				<button class="chat__reaction-item">😈</button>
				<button class="chat__reaction-item">👀</button>`;
	
}