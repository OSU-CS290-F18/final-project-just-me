fetch('data.json').then((response) => {
    response.text().then((text) => {
        if (document.getElementById('dailies')) {
            let dailies = ['Gambit', 'Crucible', 'Heroic Adventure', 'Strikes'];
            let firstResetTime = 1539277200;
            let currentTime = Math.floor((new Date()).getTime() / 1000);
            let secondsSinceFirst = currentTime - firstResetTime;
            let daysSinceFirst = Math.floor(secondsSinceFirst / 86400);
            document.getElementById('dailiesday1').innerText = "Today: " + dailies[daysSinceFirst % 4];
            document.getElementById('dailiesday2').innerText = dailies[(daysSinceFirst + 1) % 4];
            document.getElementById('dailiesday3').innerText = dailies[(daysSinceFirst + 2) % 4];
            document.getElementById('dailiesday4').innerText = dailies[(daysSinceFirst + 3) % 4];
        }

        if (document.getElementById('current-ascendant')) {
            let challenges = ['#1: Ouroborea', '#2: Forfeit Shrine', '#3: Shattered Ruins', '#4: Keep of Honed Edges', '#5: Agonarch Abyss', '#6: Cimmerian Garrison'];
            let firstResetTime = 1539709200;
            let currentTime = Math.floor((new Date()).getTime() / 1000);
            let secondsSinceFirst = currentTime - firstResetTime;
            let daysSinceFirst = Math.floor(secondsSinceFirst / 604800);
            document.getElementById('current-ascendant').innerText = challenges[daysSinceFirst % 6];
            document.getElementById('current-ascendant').href = '#ac' + (daysSinceFirst % 6).toString();
        }

        if (document.getElementById('escalation-protocol')) {
            let bosses = ['Naksud, the Famine', 'Bok Litur, Hunger of Xol', 'Nur Abath, Crest of Xol', 'Kathok, Roar of Xol', 'Damkath, the Mask'];
            let guns = ['Every IKELOS gun', 'Every IKELOS gun', 'IKELOS_SG_v1.0.1 (Shotgun)', 'IKELOS_SMG_v1.0.0 (SMG)', 'IKELOS_SR_v1.0.1 (Sniper)'];
            let firstResetTime = 1539709200;
            let currentTime = Math.floor((new Date()).getTime() / 1000);
            let secondsSinceFirst = currentTime - firstResetTime;
            let daysSinceFirst = Math.floor(secondsSinceFirst / 604800);
            document.getElementById('epboss').innerText = bosses[daysSinceFirst % 5];
            document.getElementById('epboss').href = '#ep' + (daysSinceFirst % 5).toString();
            document.getElementById('epgun').innerText = guns[daysSinceFirst % 5];
        }

        if (document.getElementById('blind-well')) {
            let bosses = ['Sikariis and Varkuuriis, Plagues of the Well', 'Cragur, Plague of the Well', 'Inomia, Plague of the Well'];
            let firstResetTime = 1539709200;
            let currentTime = Math.floor((new Date()).getTime() / 1000);
            let secondsSinceFirst = currentTime - firstResetTime;
            let daysSinceFirst = Math.floor(secondsSinceFirst / 604800);
            document.getElementById('wellboss').innerText = bosses[daysSinceFirst % 3];
            document.getElementById('wellboss').href = '#bw' + (daysSinceFirst % 3).toString();
        }
    })
})