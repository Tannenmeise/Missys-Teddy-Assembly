# Missy's Teddy Assembly (PRIMA exam task)

3D game made with [FUDGE](https://github.com/JirkaDellOro/FUDGE)
___


# PRIMA | WiSe20/21

## Abgabe

- [Lauffähige Anwendung](https://tannenmeise.github.io/Missys-Teddy-Assembly/Build/Main.html)
- [Quellcode](https://github.com/Tannenmeise/Missys-Teddy-Assembly/tree/main/SourceCode)
- [Designdokument](https://github.com/Tannenmeise/Missys-Teddy-Assembly/blob/main/Dokumente/Designdokument.pdf)
- [Archiv](https://github.com/Tannenmeise/Missys-Teddy-Assembly/blob/main/Dokumente/Archiv.zip)

## Checkliste für Leistungsnachweis
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU

| Nr | Bezeichnung           | Inhalt                                                                                                                                                                                                                                                                         |
|---:|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|    | Titel                 | Missy's Teddy Assembly
|    | Name                  | Tamara Hezel
|    | Matrikelnummer        | 263157
|  1 | Nutzerinteraktion     | Button-Betätigung im Menü durch Mausklicks, Steuerung des Avatars durch Tastatur und Maus, Eingabe in Maschinen durch Tastatur.                                                                                                                                              |
|  2 | Objektinteraktion     | Kollisionsprüfung zwischen Avatar und (teils unsichtbaren) Wänden, hindert Avatar daran durch Wände zu laufen.                                                                                                                                                                                |
|  3 | Objektanzahl variabel | Teddybären können durch die Interaktion mit der ersten Maschine zu einem beliebigen Zeitpunkt (, wenn die Maschine frei ist) erzeugt werden. Kunden werden in einem durch den Schwierigkeitsgrad festgelegten Takt (= alle x Sekunden) automatisch erzeugt.                                                                                                                                                    |
|  4 | Szenenhierarchie      | (siehe [Szenenhierarchie](https://github.com/Tannenmeise/Missys-Teddy-Assembly/blob/main/Dokumente/Szenenhierarchie.pdf)) Die Teddybären sind sinngemäß das Kind der Machine, in der sie sich gerade befinden.                                                                                                                                                        |
|  5 | Sound                 | Eintreten eines Kunden durch Glockenklingeln, Interaktionen mit Kunden durch "Mhm!" und "Hm?" Geräusche, Kundenunzufriedenheit durch Grummelgeräusche, Münzengeräusch bei Übergeben des richtigen Teddybären, Maschinengeräusche bei aktiver Produktion, Trillerpfeife bei Schichtende. Freundliche und sorglose Musik für den Menüscreen und während des laufenden Spiels.                                                         |
|  6 | GUI                   | Auswahl der Schwierigkeit und des Modus am Anfang im Hauptmenü unter "Optionen".                                            |
|  7 | Externe Daten         | Schwierigkeitsgradbestimmte Parameter in "Difficulties.json"; difficulty (beeinflusst score-Berechnung), machineTime (bestimmt Produktionszeit der Maschinen), customerTime (bestimmt wie lange Kunden auf ihre Bestellung warten), spawnTime (bestimmt nach wievielen Millisekunden ein neuer Kunde erscheint).                                                            |
|  8 | Verhaltensklassen     | Klassen: Customer (aktualisieren, betreten, verlassen, löschen, Bestellung anzeigen, Bestellung überprüfen), GameObject (Aufprall/Kollision), Machine (aktualisieren, zurücksetzen), TeddyBear (Augenfarbe, Accessoire und Geräusch hinzufügen). Zusätzlich wird das Verhalten von den Maschinen und Kunden durch eine StateMachine (StateMachineMachine und StateMachineCustomer) bestimmt.                                                                                        |
|  9 | Subklassen            | (siehe [Klassendiagramm](https://github.com/Tannenmeise/Missys-Teddy-Assembly/blob/main/Dokumente/Klassendiagramm.pdf)) Viele Klassen sind Kinder von GameObject, was wiederum ein Kind von f.Node ist. Instanzen der Klasse f.Node dienen hauptsächlich zur Sortierung (z.B. Fundament des Geschäfts: "building" hat die Kinder "floor", "ceiling" und "walls"). Instanzen der Klasse GameObject sind im Spiel sichtbare Objekte, d.h. sie haben unter anderem eine Position und Material. Maschinen, Kunden und Teddybären brauchen hingegen noch weitere für sich spezielle Methoden wie unter dem Punk (8) Verhaltensklassen erläutert. |
| 10 | Maße & Positionen     | 1 entspricht 1m. Spielfiguren haben dementsprechend einerealisitsche Größe. Der Ursprung liegt etwa in der Mitte des Geschäfts. Man spielt in der x-z-Ebene.                                                                |
| 11 | Event-System          | Tastenevents und Mausklickevents. Beispiel: Drücken von "1" im Maschinen-Input-Fenster führt dazu, dass ein Teddy mit der Option 1 (Fellfarbe: braun) erstellt oder die Option 1 (z.B. Augenfarbe: schwarz).                                                                                                                                                                                  |
