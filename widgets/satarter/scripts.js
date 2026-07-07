/// <reference path="../../sdk/v1/scripts.js" />

// Veřejné API SATarteru (read-only, CORS povolen, cache 60 s na straně serveru).
const SATARTER_BASE_URL = 'https://satarter.twentyone.cz';

// UI texty widgetu; texty datové (částky, plurály, stav) chodí lokalizované
// přímo ze stats.json (?lang=).
const UI = {
    cs: {
        supporters: 'Přispěvatelé',
        empty: 'Zatím nikdo — buď první!',
        errNoCampaign: 'Zadej ID kampaně z adresy detailu (…/campaigns/<ID>).',
        errNotFound: 'Kampaň nenalezena.',
        errServer: (status) => `SATarter vrátil chybu ${status}.`,
    },
    en: {
        supporters: 'Supporters',
        empty: 'No one yet — be the first!',
        errNoCampaign: 'Enter a campaign ID from its detail URL (…/campaigns/<ID>).',
        errNotFound: 'Campaign not found.',
        errServer: (status) => `SATarter returned error ${status}.`,
    },
};

/**
 * Extract campaign ID from the param value — accepts a bare UUID
 * or a full campaign URL pasted from the browser.
 * @param {string} raw
 * @returns {string|null}
 */
function parseCampaignId(raw) {
    const match = String(raw ?? '').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : null;
}

async function main() {
    const { params, select, net, ready, overlay } = sdk();
    const lang = params.getAllowed('language', ['cs', 'en'], 'cs');
    const ui = UI[lang];
    select.id('side-title').textContent = ui.supporters;

    try {
        const id = parseCampaignId(params.getAny('campaign', ''));
        if (!id) throw new Error(ui.errNoCampaign);

        const res = await net.fetch(`${SATARTER_BASE_URL}/campaigns/${id}/stats.json?lang=${lang}`);
        if (res.status === 404) throw new Error(ui.errNotFound);
        if (!res.ok) throw new Error(ui.errServer(res.status));
        const data = await res.json();

        select.id('title').textContent = data.title;
        select.id('time').textContent = data.texts.time;
        select.id('amount').textContent = data.texts.amount;

        const pct = data.percentOfTarget;
        const pctText = lang === 'cs' ? `${pct?.toFixed(1).replace('.', ',')} %` : `${pct?.toFixed(1)}%`;
        select.id('pct').textContent = pct == null ? '— %' : pctText;
        select.id('bar-fill').style.width = `${Math.max(0, Math.min(100, pct ?? 0))}%`;
        if (pct != null && pct >= 100) select.id('container').classList.add('funded');

        const goalWord = lang === 'cs' ? 'cíl' : 'goal';
        const metaParts = [`${goalWord} ${data.texts.target}`, data.texts.pledges];
        if (data.raised.combined == null) metaParts.push(lang === 'cs' ? 'kurz nedostupný' : 'rate unavailable');
        select.id('meta').textContent = metaParts.join('  ·  ');

        const list = select.id('supporters');
        const shown = (data.supporters ?? []).slice(0, params.size === 'full' ? 5 : 3);
        for (const s of shown) {
            const li = document.createElement('li');
            const who = document.createElement('span');
            who.className = 'who';
            who.textContent = s.name;
            const amt = document.createElement('span');
            amt.className = 'amt';
            amt.textContent = s.amountText;
            li.append(who, amt);
            list.appendChild(li);
        }
        if (shown.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = ui.empty;
            list.appendChild(li);
        }
    } catch (error) {
        overlay.showError(error.message);
    } finally {
        ready();
    }
}

main();
