define(function(require, exports, module) {
    return module.exports = {
        'lang': 'Français',
        'template': {
            'default': 'Mindmap',
            'tianpan': 'Nébuleuse',
            'structure': 'Organigramme',
            'filetree': 'Organigramme annuaire',
            'right': 'Diagramme logique',
            'fish-bone': 'Squelette'
        },
        'theme': {
            'classic': 'Classique',
            'classic-compact': 'Classique compact',
            'snow': 'Sombre',
            'snow-compact': 'Sombre compact',
            'fish': 'Squelette',
            'wire': 'Fil de fer',
            'fresh-red': 'Rouge',
            'fresh-soil': 'Marron',
            'fresh-green': 'Vert',
            'fresh-blue': 'Bleu',
            'fresh-purple': 'Violet',
            'fresh-pink': 'Rose',
            'fresh-red-compat': 'Rouge compact',
            'fresh-soil-compat': 'Marron compact',
            'fresh-green-compat': 'Vert compact',
            'fresh-blue-compat': 'Bleu compact',
            'fresh-purple-compat': 'Violet compact',
            'fresh-pink-compat': 'Rose compact',
            'tianpan': 'Cadran',
            'tianpan-compact': 'Cadran compact'
        },
        'maintopic': 'Sujet principal',
        'topic': 'branche',
        'panels': {
            'history': 'historique',
            'template': 'modele',
            'theme': 'theme',
            'layout': 'disposition',
            'style': 'style',
            'font': 'texte',
            'color': 'couleur',
            'background': '',
            'insert': 'insérer',
            'arrange': 'ajuster',
            'nodeop': 'actuel',
            'priority': 'priorité',
            'progress': 'progression',
            'resource': 'ressource',
            'note': 'note',
            'attachment': 'fichier joint',
            'word': 'texte'
        },
        'ui': {
            'langsavesuccess': 'Paramètre de langue enregistré. Veuillez redémarrer l\'application pour appliquer les modifications.',
            'untitledfilename': 'Mindmap sans titre.km',
            'fileinfo': {
                'title': 'Informations sur le fichier',
                'filename': 'Nom du fichier',
                'path': 'Chemin',
                'size': 'Taille',
                'created': 'Créé',
                'modified': 'Modifié',
                'newfilehint': 'Fichier pas encore enregistré'
            },
            'undo': 'Annuler',
            'file': {
                'new': 'Nouveau',
                'open': 'Ouvrir',
                'save': 'Enregistrer',
                'saveas': 'Enregistrer sous',
                'info': 'Info',
                'export': 'Exporter',
                'import': 'Importer',
                'importdesc': 'Sélectionner le format de fichier à importer',
                'exportdesc': 'Sélectionner le format de fichier à exporter',
                'print': 'Imprimer',
                'close': 'Fermer',
                'settings': 'Paramètres',
                'about': 'À propos',
                'recentfiles': 'Fichiers récents',
                'clearhistory': 'Effacer l\'historique',
                'norecentfiles': 'Aucun fichier récent'
            },
            'about': {
                'version': 'Version',
                'desc': 'Un outil de mindmap simple, basé sur Tauri et KityMinder.',
                'copyright': 'Tous droits réservés',
                'website': 'Page du projet'
            },
            'command': {
                'appendsiblingnode': 'Insérer noeud voisin',
                'appendparentnode': 'Insérer noeud parent',
                'appendchildnode': 'Insérer noeud enfant',
                'removenode': 'Supprimer',
                'editnode': 'Editer',
                'arrangeup': 'Monter',
                'arrangedown': 'Descendre',
                'resetlayout': 'Re-organise',
                'expandtoleaf': 'Déplier tous les noeuds',
                'expandtolevel1': 'Déplier au niveau 1',
                'expandtolevel2': 'Déplier au niveau 2',
                'expandtolevel3': 'Déplier au niveau 3',
                'expandtolevel4': 'Déplier au niveau 4',
                'expandtolevel5': 'Déplier au niveau 5',
                'expandtolevel6': 'Déplier au niveau 6',
                'fullscreen': 'Plein écran',
                'outline': 'contour'
            },
            'search': 'Recherche',
            'expandtoleaf': 'Déplier',
            'back': 'retour',
            'undo': 'Annuler (Ctrl + Z)',
            'redo': 'Rétablir (Ctrl + Y)',
            'tabs': {
                'file': 'Fichier',
                'idea': 'Edition',
                'appearence': 'Style',
                'view': 'Affichage',
                'settings': 'Paramètres'
            },
            'systemlanguage': 'Langue système',
            'language': 'Langue',  
            'bold': 'Gras',
            'italic': 'Italic',
            'forecolor': 'Couleur',
            'fontfamily': 'Police',
            'fontsize': 'Taille',
            'layoutstyle': 'Theme',
            'node': 'Node operation',
            'hand': 'Activer le glisser',
            'camera': 'Centrer sur le noeud principal',
            'zoom-in': 'Agrandir (Ctrl+)',
            'zoom-out': 'Dezoomer (Ctrl-)',
            'markers': 'tag',
            'help': 'Aide',
            'preference': 'Préférences',
            'expandnode': 'Déplier le noeud',
            'collapsenode': 'Fermer le noeud',
            'template': 'modèle',
            'theme': 'style',
            'clearstyle': 'Effacer le style',
            'copystyle': 'Copier le style',
            'pastestyle': 'Coller le style',
            'appendsiblingnode': 'Même theme',
            'appendchildnode': 'theme enfant',
            'arrangeup': 'Monter',
            'arrangedown': 'Descendre',
            'editnode': 'Editer',
            'removenode': 'Supprimer',
            'no priority' : 'Pas de priorité',
	    'priority': 'Priorité',
            'progress': {
                'p1': 'Non démarré',
                'p2': 'Completé à 1/8',
                'p3': 'Completé à 1/4',
                'p4': 'Completé à 3/8',
                'p5': 'Completé à moité',
                'p6': 'Completé à 5/8',
                'p7': 'Completé à 3/4',
                'p8': 'Completé à 7/8',
                'p9': 'Terminé',
                'p0': 'Supprimer la progression'
            },
            'resource': {
                'add': 'Ajouter'
            },
            'link': 'Lien',
            'image': 'Image',
            'note': 'Note',
            'insertlink': 'Inserer un lien',
            'insertimage': 'Inserer une image',
            'insertnote': 'Inserer une note',
            'removelink': 'Supprimer un lien existant',
            'removeimage': 'Supprimer une image existante',
            'removenote': 'Supprimer une note existante',
            'resetlayout': 'Re-organise',
            'navigator': 'Navigateur',
            'selectall': 'Selectionner tout',
            'selectrevert': 'Inverser la selection',
            'selectsiblings': 'Sélectionner les voisins',
            'selectlevel': 'Sélectionner le niveau',
            'selectpath': 'Sélectionner le chemin',
            'selecttree': 'Sélectionner la sous-arborescence',
            'noteeditor': {
                'title': 'Note',
                'hint': 'Supporte la syntax GFM',
                'placeholder': 'Merci de sélectionner une note'
            },
            'dialog': {
                'image': {
                    'title': 'Image',
                    'imagesearch': 'Recherche d\'image',
                    'keyword': 'Mot clé：',
                    'placeholder': 'Mot(s) clé(s) de recherche',
                    'baidu': 'Recherche',
                    'linkimage': 'Lien vers l\'image',
                    'linkurl': 'Adresse：',
                    'placeholder2': 'Requis：Commence par http(s)://',
                    'imagehint': 'Astuce：',
                    'placeholder3': 'Optionnel：Texte au survol de l\'image',
                    'preview': 'Apercus de l\'image：',
                    'uploadimage': 'Charger une image',
                    'selectfile': 'Ouvrir un fichier...',
                    'ok': 'OK',
                    'cancel': 'Annuler',
                    'formatinfo': 'Le fichier doit être jpg, gif ou png'
                },
                'hyperlink': {
                    'title': 'Lien',
                    'linkurl': 'Adresse：',
                    'linkhint': 'Astuce：',
                    'placeholder': 'Requis：Commence par http(s):// ou ftp://',
                    'placeholder2': 'Optionnel: Texte au survol du lien',
                    'ok': 'OK',
                    'cancel': 'Annuler'

                },
                'exportnode': {
                    'title': 'Exporter le Noeud',
                    'ok': 'OK',
                    'cancel': 'Annuler'
                },
                'unsaved': {
                    'title': 'Modifications non enregistrées',
                    'message': 'Vous avez des modifications non enregistrées. Voulez-vous les enregistrer?',
                    'save': 'Enregistrer',
                    'dontsave': 'Ne pas enregistrer',
                    'cancel': 'Annuler'
                },
                'settings': {
                    'title': 'Paramètres',
                    'themecolor': 'Couleur du thème',
                    'ok': 'OK',
                    'cancel': 'Annuler'
                },
                'exportMarkdown': {
                    'title': 'Exporter en Markdown',
                    'headingLevels': 'Niveaux de titres',
                    'level': 'niveau',
                    'levels': 'niveaux',
                    'headingLevelsHint': 'Les noeuds au-delà des niveaux de titres utiliseront le format liste',
                    'rootNodeStyle': 'Style du noeud racine',
                    'rootAsDocTitle': 'Comme titre du document (Recommandé)',
                    'rootAsHeading': 'Comme titre normal',
                    'includeOptions': 'Inclure',
                    'includeNote': 'Inclure les notes',
                    'includeLink': 'Inclure les liens',
                    'cancel': 'Annuler',
                    'export': 'Exporter'
                },
		'search': {
			'result': 'Résultat',
			'on': 'sur'
		}
            },
            'error': {
                'failedtoopenfile': 'Échec de l\'ouverture du fichier',
                'unsupportedformat': 'Format de fichier non pris en charge',
                'protocolnotavailable': 'Gestionnaire de protocole non disponible'
            }
        },
        'runtime': {
            'minder': {
                'maintopic': 'Sujet Principal'
            },
            'node': {
                'arrangeup': 'Monter',
                'appendchildnode': 'Enfant',
                'appendsiblingnode': 'Voisin',
                'arrangedown': 'Desc.',
                'removenode': 'Suppr.',
                'appendparentnode': 'Parent',
                'selectall': 'Tout sélectionner',
                'topic': 'Sujet',
                'importnode': 'Importer un noeud',
                'exportnode': 'Exporter un noeud'
            },
            'input': {
                'edit': 'Edition'
            },
            'priority': {
                'main': 'Priorité',
                'remove': 'Supprimer',
                'esc': 'Retour'
            },
            'progress': {
                'main': 'Progression',
                'remove': 'Supprimer',
                'esc': 'Retour'
            },
            'history': {
                'undo': 'Annuler',
                'redo': 'Rétablir'
            }
        }
    };
});
