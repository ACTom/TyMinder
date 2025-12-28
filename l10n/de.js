define(function(require, exports, module) {
    return module.exports = {
        'lang': 'Deutsch',
        'template': {
            'default': 'Mind Map',
            'tianpan': 'Spiralform',
            'structure': 'Organigramm',
            'filetree': 'Verzeichnis-Organigramm',
            'right': 'Logisches Strukturdiagramm',
            'fish-bone': 'Fischknochenfigur'
        },
        'theme': {
            'classic': 'Klassisch',
            'classic-compact': 'Klassisch Kompakt',
            'snow': 'Klassisch 2',
            'snow-compact': 'Kompakt klassisch 2',
            'fish': 'Fischknochen',
            'wire': 'Drahtgitter',
            'fresh-red': 'Rot',
            'fresh-soil': 'Braun',
            'fresh-green': 'Grün',
            'fresh-blue': 'Blau',
            'fresh-purple': 'Lila',
            'fresh-pink': 'Pink',
            'fresh-red-compat': 'Kompakt rot',
            'fresh-soil-compat': 'Kompakt braun',
            'fresh-green-compat': 'Kompakt grün',
            'fresh-blue-compat': 'Kompakt blau',
            'fresh-purple-compat': 'Kompakt lila',
            'fresh-pink-compat': 'Kompakt pink',
            'tianpan': 'Runde Knoten',
            'tianpan-compact': 'Kompakt runde Knoten'
        },
        'maintopic': 'Hauptthema',
        'topic': 'Zweigthema',
        'panels': {
            'history': 'Verlauf',
            'template': 'Vorlage',
            'theme': 'Darstellung',
            'layout': 'Layout',
            'style': 'Stil',
            'font': 'Schriftgröße',
            'color': 'Schriftfarbe',
            'background': 'Hintergrundfarbe',
            'insert': 'Einfügen',
            'arrange': 'Anordnen',
            'nodeop': 'aktuell',
            'priority': 'Priorität',
            'progress': 'Fortschritt',
            'resource': 'Ressourcen',
            'note': 'Notizen',
            'attachment': 'Anhang',
            'word': 'Text'
        },
        'ui': {
            'langsavesuccess': 'Spracheinstellung gespeichert. Bitte starten Sie die Anwendung neu, um die Änderungen vollständig anzuwenden.',
            'untitledfilename': 'Unbenannte Mindmap.km',
            'fileinfo': {
                'title': 'Dateiinformationen',
                'filename': 'Dateiname',
                'path': 'Pfad',
                'size': 'Größe',
                'created': 'Erstellt',
                'modified': 'Geändert',
                'newfilehint': 'Datei noch nicht gespeichert'
            },
            'undo': 'Rückgängig',
            'file': {
                'new': 'Neu',
                'open': 'Öffnen',
                'save': 'Speichern',
                'saveas': 'Speichern unter',
                'info': 'Info',
                'export': 'Exportieren',
                'import': 'Importieren',
                'importdesc': 'Dateiformat zum Importieren auswählen',
                'exportdesc': 'Dateiformat zum Exportieren auswählen',
                'print': 'Drucken',
                'close': 'Schließen',
                'settings': 'Einstellungen',
                'about': 'Über',
                'recentfiles': 'Zuletzt geöffnet',
                'clearhistory': 'Verlauf löschen',
                'norecentfiles': 'Keine zuletzt geöffneten Dateien'
            },
            'about': {
                'version': 'Version',
                'desc': 'Ein einfaches Mindmap-Tool, basierend auf Tauri und KityMinder.',
                'copyright': 'Alle Rechte vorbehalten',
                'website': 'Projekt-Homepage'
            },
            'command': {
                'appendsiblingnode': 'Neuer Geschwisterknoten',
                'appendparentnode': 'Neuer Überknoten unterhalb',
                'appendchildnode': 'Neuer Unterknoten',
                'removenode': 'Löschen',
                'editnode': 'Bearbeiten',
                'arrangeup': 'nach oben',
                'arrangedown': 'nach unten',
                'resetlayout': 'Layout zurücksetzen',
                'expandtoleaf': 'Alle Knoten ausklappen',
                'expandtolevel1': 'Ausklappen bis Knoten der 1. Ebene',
                'expandtolevel2': 'Ausklappen bis zu Knoten der 2. Ebene',
                'expandtolevel3': 'Ausklappen bis zu Knoten der 3. Ebene',
                'expandtolevel4': 'Ausklappen bis zu Knoten der 4. Ebene',
                'expandtolevel5': 'Ausklappen bis zu Knoten der 5. Ebene',
                'expandtolevel6': 'Ausklappen bis zu Knoten der 6. Ebene',
                'fullscreen': 'Vollbild',
                'outline': 'Gliederung'
            },
            'search':'Suchen',
            'expandtoleaf': 'Erweitern',
            'back': 'Zurück',
            'undo': 'Rückgängig',
            'redo': 'Wiederholen',
            'tabs': {
                'file': 'Datei',
                'idea': 'Idee',
                'appearence': 'Darstellung',
                'view': 'Ansicht',
                'settings': 'Einstellungen'
            },
            'systemlanguage': 'Systemsprache',
            'language': 'Sprache',  
            'bold': 'Fett',
            'italic': 'Kursiv',
            'forecolor': 'Schriftfarbe',
            'fontfamily': 'Schriftart',
            'fontsize': 'Schriftgröße',
            'layoutstyle': 'Darstellung',
            'node': 'Knotenoperation',
            'hand': 'Verschieben',
            'camera': 'Stammknoten zentrieren',
            'zoom-in': 'Vergrößern',
            'zoom-out': 'Verkleinern',
            'markers': 'Markierungen',
            'help': 'Hilfe',
            'preference': 'Einstellungen',
            'expandnode': 'Auf das Blatt erweitern',
            'collapsenode': 'einen Level-1-Knoten erhalten',
            'template': 'Vorlage',
            'theme': 'Darstellung',
            'clearstyle': 'Formatierung löschen',
            'copystyle': 'Formatierung kopieren',
            'pastestyle': 'Formatierung übertragen',
            'appendsiblingnode': 'Geschwisterknoten einfügen',
            'appendchildnode': 'Kindknoten einfügen',
            'arrangeup': 'Voreinstellung',
            'arrangedown': 'Nachstimmen',
            'editnode': 'Bearbeiten',
            'removenode': 'Löschen',
            'priority': 'Priorität',
            'progress': {
                'p1': 'Nicht begonnen',
                'p2': '1/8 fertiggestellt',
                'p3': '1/4 fertiggestellt',
                'p4': '3/8 fertiggestellt',
                'p5': '1/2 fertiggestellt',
                'p6': '5/8 fertiggestellt',
                'p7': '3/4 fertiggestellt',
                'p8': '7/8 fertiggestellt',
                'p9': 'Abgeschlossen',
                'p0': 'Klarer Fortschritt'
            },
            'resource': {
                'add': 'hinzufügen'
            },
            'link': 'Link',
            'image': 'Bild',
            'note': 'Notiz',
            'insertlink': 'Link einfügen',
            'insertimage': 'Bild einfügen',
            'insertnote': 'Notiz einfügen',
            'removelink': 'Link löschen',
            'removeimage': 'Bild löschen',
            'removenote': 'Notiz löschen',
            'resetlayout': 'Organisieren',
            'navigator': 'Navigator',
            'selectall': 'Alles auswählen',
            'selectrevert': 'Auswahl umkehren',
            'selectsiblings': 'Geschwisterknoten auswählen',
            'selectlevel': 'Alle Knoten derselben Ebene auswählen',
            'selectpath': 'Pfad auswählen',
            'selecttree': 'Teilbaum auswählen',
            'noteeditor': {
                'title': 'Notiz',
                'hint': 'Formatierungshilfe (chinesisch)',
                'placeholder': 'Notiz zum Bearbeiten auswählen'
            },
            'dialog': {
                'image': {
                    'title': 'Bild',
                    'imagesearch': 'Bild suchen',
                    'keyword': 'Schlagwort：',
                    'placeholder': 'Bitte Schlagwort für Suche eingeben',
                    'baidu': 'Suchen',
                    'linkimage': 'Link auf Bild',
                    'linkurl': 'URL：',
                    'placeholder2': 'Muss mit http(s):// beginnen',
                    'imagehint': 'Hinweis：',
                    'placeholder3': 'Optional：Text für den Tooltip, wenn die Maus sich über dem Bild befindet',
                    'preview': 'Bildvorschau：',
                    'uploadimage': 'Bild hochladen',
                    'selectfile': 'Datei auswählen',
                    'ok': 'OK',
                    'cancel': 'Abbrechen',
                    'formatinfo': 'Bild im Format jpg, gif oder png'
                },
                'hyperlink': {
                    'title': 'Link',
                    'linkurl': 'URL：',
                    'linkhint': 'Hinweis：',
                    'placeholder': 'Muss mit http(s):// oderftp:// beginnen',
                    'placeholder2': 'Optional: Text für den Tooltip, wenn die Maus sich über dem Link befindet',
                    'ok': 'OK',
                    'cancel': 'Abbrechen'

                },
                'exportnode': {
                    'title': 'Knoten exportieren',
                    'ok': 'OK',
                    'cancel': 'Abbrechen'
                },
                'unsaved': {
                    'title': 'Ungespeicherte Änderungen',
                    'message': 'Es gibt ungespeicherte Änderungen. Möchten Sie speichern?',
                    'save': 'Speichern',
                    'dontsave': 'Nicht speichern',
                    'cancel': 'Abbrechen'
                },
                'settings': {
                    'title': 'Einstellungen',
                    'themecolor': 'Themenfarbe',
                    'ok': 'OK',
                    'cancel': 'Abbrechen'
                },
                'exportMarkdown': {
                    'title': 'Als Markdown exportieren',
                    'headingLevels': 'Überschriftenebenen',
                    'level': 'Ebene',
                    'levels': 'Ebenen',
                    'headingLevelsHint': 'Knoten über den Überschriftenebenen werden als Liste formatiert',
                    'rootNodeStyle': 'Stammknoten-Stil',
                    'rootAsDocTitle': 'Als Dokumenttitel (Empfohlen)',
                    'rootAsHeading': 'Als normale Überschrift',
                    'includeOptions': 'Einschließen',
                    'includeNote': 'Notizen einschließen',
                    'includeLink': 'Links einschließen',
                    'cancel': 'Abbrechen',
                    'export': 'Exportieren'
                }
            },
            'error': {
                'failedtoopenfile': 'Datei konnte nicht geöffnet werden',
                'unsupportedformat': 'Nicht unterstütztes Dateiformat',
                'protocolnotavailable': 'Protokollmanager nicht verfügbar'
            }
        },
        'runtime': {
            'minder': {
                'maintopic': 'Hauptthema'
            },
            'node': {
                'arrangeup': 'Arrange Up',
                'appendchildnode': 'Neuer Unterknoten',
                'appendsiblingnode': 'Neuer Geschwisterknoten',
                'arrangedown': 'Arrange Down',
                'removenode': 'Knoten löschen',
                'appendparentnode': 'Append Parent Node',
                'selectall': 'Alles auswählen',
                'topic': 'Thema',
                'importnode': 'Knoten importieren',
                'exportnode': 'Knoten exportieren'
            },
            'input': {
                'edit': 'Bearbeiten'
            },
            'priority': {
                'main': 'Priorität',
                'remove': 'Löschen',
                'esc': 'Abbrechen'
            },
            'progress': {
                'main': 'Fortschritt',
                'remove': 'Löschen',
                'esc': 'Abbrechen'
            },
            'history': {
                'undo': 'Rückgängig',
                'redo': 'Wiederholen'
            }
        }
    };
});
