function baseUi () {
	d20plus.ui = {};

	d20plus.ui.addHtmlHeader = () => {
		d20plus.ut.log("Add HTML");
		const $body = $("body");

		const $wrpSettings = $(`<div id="betteR20-settings"/>`);
		$("#mysettings > .content").children("hr").first().before($wrpSettings);

		$wrpSettings.append(d20plus.settingsHtmlHeader);
		$body.append(d20plus.configEditorHTML);
		if (window.is_gm) {
			$(`#imagedialog`).find(`.searchbox`).find(`.tabcontainer`).first().after(d20plus.artTabHtml);
			$(`#button-add-external-art`).on(window.mousedowntype, d20plus.art.button);

			$body.append(d20plus.addArtHTML);
			$body.append(d20plus.addArtMassAdderHTML);
			$body.append(d20plus.tool.toolsListHtml);
			$("#d20plus-artfolder").dialog({
				autoOpen: false,
				resizable: true,
				width: 1000,
				height: 800,
			});
			$("#d20plus-artmassadd").dialog({
				autoOpen: false,
				resizable: true,
				width: 800,
				height: 650,
			});
		}
		const $cfgEditor = $("#d20plus-configeditor");
		$cfgEditor.dialog({
			autoOpen: false,
			resizable: true,
			width: 800,
			height: 650,
		});
		$cfgEditor.parent().append(d20plus.configEditorButtonBarHTML);

		// shared GM/player conent
		// quick search box
		const $iptSearch = $(`<input id="player-search" class="ui-autocomplete-input" autocomplete="off" placeholder="Quick search by name...">`);
		const $wrprResults = $(`<div id="player-search-results" class="content searchbox"/>`);

		if (window.is_gm) {
			$iptSearch.css("width", "calc(100% - 5px)");
			const $addPoint = $("#journal").find("button.btn.superadd");
			$addPoint.after($wrprResults);
			$addPoint.after(`<br>`);
			$addPoint.after($iptSearch);
			$addPoint.after(`<br><br>`);
		} else {
			const $wrprControls = $(`<div class="content searchbox" id="search-wrp-controls"/>`);
			$(`#journal .content`).before($wrprControls).before($wrprResults);
			$iptSearch.css("max-width", "calc(100% - 140px)");
			$wrprControls.append($iptSearch);
		}
		d20plus.engine.initQuickSearch($iptSearch, $wrprResults);
	};

	d20plus.ui.addHtmlFooter = () => {
		const $wrpSettings = $(`#betteR20-settings`);
		$wrpSettings.append(d20plus.settingsHtmlPtFooter);

		$("#mysettings > .content a#button-edit-config").on(window.mousedowntype, d20plus.cfg.openConfigEditor);
		$("#button-manage-qpi").on(window.mousedowntype, qpi._openManager);
		d20plus.tool.addTools();
	};

	d20plus.ui.addQuickUiGm = () => {
		const $wrpBtnsMain = $(`#floatingtoolbar`);

		// add quick layer selection panel
		const $ulBtns = $(`<div id="floatinglayerbar"><ul/></div>`)
			.css({
				width: 30,
				position: "absolute",
				left: 20,
				top: $wrpBtnsMain.height() + 45,
				border: "1px solid #666",
				boxShadow: "1px 1px 3px #666",
				zIndex: 10600,
				backgroundColor: "rgba(255,255,255,0.80)"
			})
			.appendTo($(`body`)).find(`ul`);

		const handleClick = (clazz, evt) => $wrpBtnsMain.find(`.${clazz}`).trigger("click", evt);
		$(`<li title="Map" class="choosemap"><span class="pictos" style="padding: 0 3px;">@</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`choosemap`, evt));
		$(`<li title="Background" class="choosebackground"><span class="pictos">a</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`choosebackground`, evt));
		$(`<li title="Objects & Tokens" class="chooseobjects"><span class="pictos">b</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`chooseobjects`, evt));
		$(`<li title="Foreground" class="chooseforeground"><span class="pictos">B</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`chooseforeground`, evt));
		$(`<li title="GM Info Overlay" class="choosegmlayer"><span class="pictos">E</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`choosegmlayer`, evt));
		$(`<li title="Dynamic Lighting" class="choosewalls"><span class="pictostwo">r</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`choosewalls`, evt));
		$(`<li title="Weather Exclusions" class="chooseweather"><span class="pictos">C</span></li>`).appendTo($ulBtns).click((evt) => handleClick(`chooseweather`, evt));

		$("body").on("click", "#editinglayer li", function () {
			$("#floatinglayerbar").removeClass("map")
				.removeClass("background")
				.removeClass("objects")
				.removeClass("foreground")
				.removeClass("gmlayer")
				.removeClass("walls")
				.removeClass("weather");
			setTimeout(() => {
				$("#floatinglayerbar").addClass(window.currentEditingLayer)
			}, 1);
		});

		// add "desc sort" button to init tracker
		const $initTracker = $(`#initiativewindow`);
		const addInitSortBtn = () => {
			$(`<div class="btn" id="init-quick-sort-desc" style="margin-right: 5px;"><span class="pictos">}</span></div>`).click(() => {
				// this will throw a benign error if the settings dialog has never been opened
				$("#initiativewindow_settings .sortlist_numericdesc").click();
			}).prependTo($initTracker.parent().find(`.ui-dialog-buttonset`));
		};
		if (d20.Campaign.initiativewindow.model.attributes.initiativepage) {
			addInitSortBtn();
		} else {
			d20.Campaign.initiativewindow.model.on("change", (e) => {
				if (d20.Campaign.initiativewindow.model.attributes.initiativepage && $(`#init-quick-sort-desc`).length === 0) {
					addInitSortBtn();
					d20plus.cfg.baseHandleConfigChange();
				}
			})
		}
	};

	/**
	 * Prompt the user to choose from a list of checkboxes. By default, one checkbox can be selected, but a "count"
	 * option can be provided to allow the user to choose multiple options.
	 *
	 * @param dataArray options to choose from
	 * @param dataTitle title for the window
	 * @param messageCountIncomplete message when user does not choose correct number of choices
	 * @param displayFormatter function to format dataArray for display
	 * @param count exact number of  options the user must choose
	 * @param note add a note at the bottom of the window
	 * @return {Promise}
	 */
	d20plus.ui.chooseCheckboxList = async function (dataArray, dataTitle, {displayFormatter = null, count = null, note = null, messageCountIncomplete = null} = {}) {
		return new Promise((resolve, reject) => {
			const $dialog = $(`
				<div title="${dataTitle}">
					${count != null ? `<div name="remain" class="bold">Remaining: ${count}</div>` : ""}
					<div>
						${dataArray.map(it => `<label class="split"><span>${displayFormatter ? displayFormatter(it) : it}</span> <input data-choice="${it}" type="checkbox"></label>`).join("")}
					</div>
					${note ? `<br><div class="italic">${note}</div>` : ""}
				</div>
			`).appendTo($("body"));
			const $remain = $dialog.find(`[name="remain"]`);
			const $cbChoices = $dialog.find(`input[type="checkbox"]`);

			if (count != null) {
				$cbChoices.on("change", function () {
					const $e = $(this);
					let selectedCount = getSelected().length;
					if (selectedCount > count) {
						$e.prop("checked", false);
						selectedCount--;
					}
					$remain.text(`Remaining: ${count - selectedCount}`);
				});
			}

			function getSelected () {
				return $cbChoices.map((i, e) => ({choice: $(e).data("choice"), selected: $(e).prop("checked")})).get()
					.filter(it => it.selected).map(it => it.choice);
			}

			$dialog.dialog({
				dialogClass: "no-close",
				buttons: [
					{
						text: "Cancel",
						click: function () {
							$(this).dialog("close");
							$dialog.remove();
							reject(`User cancelled the prompt`);
						}
					},
					{
						text: "OK",
						click: function () {
							const selected = getSelected();
							if (selected.length === count || count == null) {
								$(this).dialog("close");
								$dialog.remove();
								resolve(selected);
							} else {
								alert(messageCountIncomplete ?? "Please select more options!");
							}
						}
					}
				]
			})
		});
	};

	d20plus.ui.importConfigurator = async function (data) {
		return new Promise((resolve, reject) => {
			//Render all the properties hidden to stay in order.
			const properties = 
			[{
				name: 'speed',
				display: 'Speed',
				help: 'Sets character speed'
			}, {
				name: 'ability',
				display: 'Ability Scores',
				help: 'Increases characters Ability Scores'
			}, {
				name: 'weaponProficiencies',
				display: 'Weapon Proficiencies',
				help: 'Adds weapon proficiencies'
			}, {
				name: 'armorProficiencies',
				display: 'Armor Proficiencies',
				help: 'Adds armor proficiencies'
			}, {
				name: 'languageProficiencies',
				display: 'Language Proficiencies',
				help: 'Adds language proficiencies'
			}, {
				name: 'additionalSpells',
				display: 'Innate Spells',
				help: 'Adds innate spells'
			}, {
				name: 'entries',
				display: 'Feats <i>(Hover for info)</i>',
				help: 'Adds feats'
			}]

			const countCheck = {};

			const $dialog = $(`
			<div title="Import Configuration">
				<p class="bold">Please choose what elements you want to import/update</p>
				<hr>
				${properties.map(prop => `
				<div class="${prop.name}-container" style="display: none">
					<label>
						<input data-choice="${prop.name}" type="checkbox"/> ${prop.display} <span title="${prop.help}" style="cursor: help;">[?]</span> 
					</label>
					<div id="${prop.name}" style="padding-left: 25px;"></div>
					<br> 
				</div>`).join('')}
			</div>
			`).appendTo($("body"));		
			

			Object.entries(data).sort().forEach(async ([key, val]) => {
				$dialog.find(`.${key}-container`).show()
				$dialog.find(`input[data-choice=${key}]`).prop("checked", true)

				let html = '';
				let chooseNum;

				switch (key) {
					case "name":
					case "source":
					case "page":
					case "size":
					case "resist":
					case "hasFluff":
						return;
					case 'speed':
						appendToDialog(key, Parser.getSpeedString({speed: val}), undefined)
						break;
					case 'ability':		
							html += Object.entries(val[0]).filter(([ab, num]) => ab !== 'choose').map(([ab, num]) => `${Parser.attAbvToFull(ab)} +${num}`).join(', ')

							if (val[0].choose) {
								chooseNum = val[0].choose.count || 1;
								html += ` plus +1 in ${chooseNum} of the following:` + val[0].choose.from.map(ab => `<label><input data-${varToProp(key)}="${ab}" type='checkbox'/> ${Parser.attAbvToFull(ab)}</label>`).join("")
							}
						appendToDialog (key, html, chooseNum)
						break;
					case 'weaponProficiencies':
						html += Object.entries(val[0]).filter(([weap, check]) => weap !== 'choose').map(([weap, check]) => `${check && weap.split('|')[0].toTitleCase()}`).join(', ')
						appendToDialog (key, html, chooseNum)
						break;
					case 'armorProficiencies':
						html += Object.entries(val[0]).filter(([armor, check]) => armor !== 'choose').map(([armor, check]) => `${check && armor.toTitleCase()} Armor`).join(', ')
						appendToDialog (key, html, chooseNum)
						break;
					case 'languageProficiencies':
						html += Object.entries(val[0]).filter(([lang, check]) => lang !== 'anyStandard').map(([lang, check]) => `${check && lang.toTitleCase()}`).join(', ')

						if(val[0].anyStandard) {
							chooseNum = val[0].anyStandard || 1;

							html += ` plus ${chooseNum} of the following:` 
							html += `
							<div style="display: flex;">
								<div style="padding-right: 25px;"> Standard${Parser.LANGUAGES_STANDARD.filter(lang => !val[0][lang.toLowerCase()]).map(lang => `<label><input data-${varToProp(key)}="${lang}" type='checkbox'/> ${lang}</label>`).join('')}</div>
								<div style="padding-right: 25px;"> Exotic${Parser.LANGUAGES_EXOTIC.filter(lang => !val[0][lang.toLowerCase()]).map(lang => `<label><input data-${varToProp(key)}="${lang}" type='checkbox'/> ${lang}</label>`).join('')}</div>
								<div> Secret${Parser.LANGUAGES_SECRET.filter(lang => !val[0][lang.toLowerCase()]).map(lang => `<label><input data-${varToProp(key)}="${lang}" type='checkbox'/> ${lang}</label>`).join('')}</div>
							</div>`
						}
						appendToDialog (key, html, chooseNum)
						break;
					case 'additionalSpells':
						const spells = recursiveReadInnate(val[0].innate)

						if (spells[0].data[0].choose) {
							
							$dialog.find(`#${key}`).css({'display': 'flex', 'flex-wrap': 'wrap'});

							const [_, lvl, spellCl] = spells[0].data[0].choose.match(/level=(\d)\|class=(.*)/)
							chooseNum = 1;
							html += `Choose 1 of the following: `

							const allSpells = await getAllSpells()

							html += allSpells.filter(spell => (spell.level === Number(lvl) && spell.classes?.fromClassList?.some(cl => cl.name === spellCl))).map(spell => `<label><input data-${varToProp(key)}="${spell.name}" type='checkbox'/> ${spell.name}</label>`).join('--')
								
														
						} else {
							spells.map(spData => {
								const level = spData.info[0];
								html += `At level ${level}: `
								html += spData.data.map(spell => {
									if (spell.includes("#")) {
										const [name, castlvl] = spell.split('#')
										return `${name}@lvl${castlvl}`.toTitleCase()
									} else if (spell.includes("|")) {
										const [name, source] = spell.split('|')
										return name.toTitleCase()
									} else {								
										return spell.toTitleCase()
									}
								}).join(', ')
								html += `<br>`
							})
						}

						
						if (val[0].ability.choose) {
							html += `Select spellcasting ability for race spells: ` + val[0].ability.choose.map(ab => `<label><input data-${varToProp(key)}-ability="${ab}" type='checkbox'/> ${Parser.attAbvToFull(ab)}</label>`).join("")
						}

						appendToDialog (key, html, chooseNum)
						break;						
					case "entries":
						html += val.map(feat => `<span title="${feat.entries}">${feat.name}</span>`).join(', ')
						appendToDialog (key, html, chooseNum)
						break;
				}
			})
			
			$dialog.dialog({
				dialogClass: "no-close",
				buttons: [
					{
						text: "Cancel",
						click: function () {
							$(this).dialog("close");
							$dialog.remove();
							reject(`User cancelled the prompt`);
						}
					},
					{
						text: "OK",
						click: function () {
							
							const selected = {};
							$dialog.find(`input[type="checkbox"]`).map((i, e) => {
								if ($(e).prop("checked")) {
									const [key, val] = Object.entries($(e).data())[0];
									if (key === 'choice') selected[val] = []
									else selected[key].push(val)
								}				
							})

							const output = {
								name: data.name,								
								...(data._baseName ? {_baseName: data._baseName} : {})
							};
							for (let [key, val] of Object.entries(selected)) {
								output[key] = MiscUtil.copy(data[key])
								if (val.length > 0) {
									switch (key) {										
										case 'ability':
											delete output.ability[0].choose
											val.forEach(ab => output.ability[0][ab] ?  output.ability[0][ab] += 1 : output.ability[0][ab] = 1)	
											break;
										case 'weaponProficiencies':										
											break;										
										case 'languageProficiencies':
											delete output.languageProficiencies[0].anyStandard
											val.forEach(lang => output.languageProficiencies[0][lang.toLowerCase()] = true)	
											break;
										case 'additionalSpells':
											output.additionalSpells[0].innate[1]._.pop()
											val.forEach(spell => output.additionalSpells[0].innate[1]._.push(spell))
											break;
									}
								}
							}

							let isCountRight = true;

							for (let [group, count] of Object.entries(countCheck)) {
								if (getSelected(group).length === count) continue
								else {
									isCountRight = false;
									break;
								}
							}
							
							if (isCountRight) {
								$(this).dialog("close");
								$dialog.remove();
								resolve(output);
							} else {
								alert("You have not selected all the available options!");
							}
						}
					}
				], 
				width: 600,
				height : 700
			})

			function getSelected(group) {
				return $dialog.find(`input[data-${varToProp(group)}]`).map((i, e) => ({
					choice: $(e).data(group),
					selected: $(e).prop("checked")
				})).get().filter(it => it.selected).map(it => it.choice);
			}
			
			function applyCount(group, count) {
				countCheck[group] = count;
				$dialog.find(`input[data-${varToProp(group)}]`).on("change", function() {
					const $e = $(this);
					let selectedCount = getSelected(group).length;
					if(selectedCount > count) {
						$e.prop("checked", false);
						selectedCount--;
					}
				});
			}

			function appendToDialog (categ, html, chooseNum) {
				$dialog.find(`#${categ}`).append(html)
				if (chooseNum) applyCount(categ, chooseNum)	
			}

			function varToProp (string) {
				return string.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase()
			}

			// innateDepthStructure 
			// 	0: "level"
			// 	1: "regain"
			// 	2: "times"
			function recursiveReadInnate (data, depth = 0, info = {}, out = []) {
				if (data instanceof Array){
					out.push({data: data, info: MiscUtil.copy(info)})
				}
				else {
					for (let [key, val] of Object.entries(data)){
						info[depth] = key;
						const i = Number(depth) + 1;
						recursiveReadInnate (val, i, info, out)
					}
				}
				return out;
			}

			function getAllSpells () {
				return new Promise(async resolve => {
					const toLoad = Object.keys(spellDataUrls).filter(src => !SourceUtil.isNonstandardSource(src)).map(src => d20plus.spells.formSpellUrl(spellDataUrls[src]));
					const dataStack = (await Promise.all(toLoad.map(async url => DataUtil.loadJSON(url)))).flat().map(i=>i.spell).flat();
					resolve (dataStack)
				})
			}
		})
	}
}


SCRIPT_EXTENSIONS.push(baseUi);
