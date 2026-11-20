/**
 * Check-in do Corre que dá Tempo — Google Apps Script ligado a uma planilha.
 *
 * Como instalar (passo a passo completo no README do site):
 *  1. Crie uma planilha no Google Sheets e abra Extensões > Apps Script.
 *  2. Cole este arquivo inteiro, salve e execute a função `setup` uma vez (autorize).
 *  3. Copie o segredo que aparece no registro de execução para CHECKIN_SECRET no site.
 *  4. Implantar > Nova implantação > App da Web. Executar como: Eu. Acesso: Qualquer pessoa.
 *  5. Copie a URL do app da Web para CHECKIN_SCRIPT_URL no site.
 *
 * Abas criadas:
 *  - Presencas: uma linha por check-in (pode apagar linhas para corrigir).
 *  - Config: dia e horário do check-in, código opcional e seguidores do Instagram.
 *
 * Nomes de crianças ficam só na planilha: o site recebe apenas a contagem.
 */

var TZ = 'America/Recife';
var SHEET_PRESENCAS = 'Presencas';
var SHEET_CONFIG = 'Config';
var HEADERS = ['Data', 'Hora', 'Nome', 'Tipo', 'Responsavel', 'Chave', 'Origem'];

// dia_semana: 1 = segunda ... 7 = domingo (3 = quarta-feira)
var DEFAULT_CONFIG = [
  ['dia_semana', '3', '1 = segunda ... 7 = domingo'],
  ['abre', '19:30', 'Horário em que o check-in abre (HH:mm, horário de Recife)'],
  ['fecha', '21:30', 'Horário em que o check-in fecha'],
  ['exigir_codigo', 'NAO', 'SIM para exigir o código do dia'],
  ['codigo', '', 'Código do dia, anunciado na concentração (só se exigir_codigo = SIM)'],
  ['seguidores_instagram', '1227', 'Número exibido no site; atualize quando quiser'],
];

/* ===================== Entradas do App da Web ===================== */

function setup() {
  ensureSheets_();
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('CHECKIN_SECRET');
  if (!secret) {
    secret = Utilities.getUuid();
    props.setProperty('CHECKIN_SECRET', secret);
  }
  Logger.log('Planilha pronta. CHECKIN_SECRET = ' + secret);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!authorized_(p.secret)) return json_({ ok: false, erro: 'nao_autorizado' });
  var ss = ensureSheets_();
  return json_(buildStats(readRows_(ss), readConfig_(ss), new Date()));
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, erro: 'json_invalido' });
  }
  if (!authorized_(body.secret)) return json_({ ok: false, erro: 'nao_autorizado' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = ensureSheets_();
    var config = readConfig_(ss);
    var rows = readRows_(ss);
    var now = new Date();
    var result = validateCheckin(body, rows, config, now);
    if (!result.ok) return json_(result);
    if (!result.duplicado) {
      ss.getSheetByName(SHEET_PRESENCAS).appendRow(result.row);
      rows.push(rowToObj_(result.row));
    }
    var stats = buildStats(rows, config, now);
    return json_({ ok: true, duplicado: !!result.duplicado, nome: result.nome, tipo: result.tipo, hoje: stats.hoje });
  } finally {
    lock.releaseLock();
  }
}

/* ===================== Regras (funções puras) ===================== */

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove caracteres que a planilha interpretaria como fórmula e limita o tamanho. */
function cleanName(s) {
  return String(s || '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[=+\-@'\s]+/, '')
    .slice(0, 40);
}

function recifeNow(now) {
  return {
    date: Utilities.formatDate(now, TZ, 'yyyy-MM-dd'),
    time: Utilities.formatDate(now, TZ, 'HH:mm'),
    dow: Number(Utilities.formatDate(now, TZ, 'u')),
  };
}

function isOpen(config, now) {
  var t = recifeNow(now);
  return String(t.dow) === String(config.dia_semana) && t.time >= config.abre && t.time <= config.fecha;
}

function validateCheckin(body, rows, config, now) {
  var t = recifeNow(now);
  if (!isOpen(config, now)) {
    return { ok: false, erro: 'fechado', mensagem: 'O check-in abre ' + diaNome_(config.dia_semana) + ', das ' + config.abre + ' às ' + config.fecha + '.' };
  }
  var tipoNorm = normalize(body.tipo);
  var tipo = tipoNorm === 'adulto' ? 'Adulto' : tipoNorm === 'crianca' ? 'Criança' : null;
  if (!tipo) return { ok: false, erro: 'tipo', mensagem: 'Escolha adulto ou criança.' };

  var nome = cleanName(body.nome);
  if (nome.length < 2) return { ok: false, erro: 'nome', mensagem: 'Informe seu nome ou apelido.' };

  var responsavel = '';
  if (tipo === 'Criança') {
    responsavel = cleanName(body.responsavel);
    if (responsavel.length < 2) return { ok: false, erro: 'responsavel', mensagem: 'Informe o nome do responsável.' };
  }
  if (body.consentimento !== true) {
    return { ok: false, erro: 'consentimento', mensagem: 'É preciso aceitar o aviso de privacidade.' };
  }
  if (String(config.exigir_codigo).toUpperCase() === 'SIM' && normalize(body.codigo) !== normalize(config.codigo)) {
    return { ok: false, erro: 'codigo', mensagem: 'Código do dia incorreto. Ele é anunciado na concentração.' };
  }

  var chave = tipo === 'Criança' ? 'c:' + normalize(nome) + '|' + normalize(responsavel) : 'a:' + normalize(nome);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].data === t.date && rows[i].chave === chave) {
      return { ok: true, duplicado: true, nome: nome, tipo: tipo };
    }
  }
  var origem = body.origem === 'qr' ? 'qr' : 'site';
  return { ok: true, nome: nome, tipo: tipo, row: [t.date, t.time, nome, tipo, responsavel, chave, origem] };
}

function buildStats(rows, config, now) {
  var t = recifeNow(now);
  var mes = t.date.slice(0, 7);
  var porData = {};
  var corredores = {};

  rows.forEach(function (r) {
    if (!r.data) return;
    var d = porData[r.data] || (porData[r.data] = { data: r.data, adultos: 0, criancas: 0, total: 0 });
    if (r.tipo === 'Criança') d.criancas++;
    else d.adultos++;
    d.total++;

    if (r.tipo !== 'Criança') {
      var c = corredores[r.chave] || (corredores[r.chave] = { nome: r.nome, presencas: 0, mes: 0, primeiro: r.data, ultimo: r.data });
      c.presencas++;
      if (r.data.slice(0, 7) === mes) c.mes++;
      if (r.data < c.primeiro) c.primeiro = r.data;
      if (r.data >= c.ultimo) {
        c.ultimo = r.data;
        c.nome = r.nome; // grafia mais recente
      }
    }
  });

  var treinos = Object.keys(porData).sort().map(function (k) { return porData[k]; });
  var hoje = porData[t.date] || { data: t.date, adultos: 0, criancas: 0, total: 0 };

  return {
    ok: true,
    atualizadoEm: now.toISOString(),
    aberto: isOpen(config, now),
    exigeCodigo: String(config.exigir_codigo).toUpperCase() === 'SIM',
    config: {
      dia_semana: Number(config.dia_semana),
      abre: config.abre,
      fecha: config.fecha,
      seguidores_instagram: Number(String(config.seguidores_instagram).replace(/\D/g, '')) || 0,
    },
    hoje: hoje,
    treinos: treinos,
    corredores: Object.keys(corredores).map(function (k) {
      var c = corredores[k];
      return { nome: c.nome, presencas: c.presencas, mes: c.mes, primeiro: c.primeiro, ultimo: c.ultimo };
    }),
  };
}

/* ===================== Planilha ===================== */

function ensureSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pres = ss.getSheetByName(SHEET_PRESENCAS);
  if (!pres) {
    pres = ss.insertSheet(SHEET_PRESENCAS);
    pres.appendRow(HEADERS);
    pres.setFrozenRows(1);
    pres.getRange('A:B').setNumberFormat('@'); // data e hora como texto
  }
  var cfg = ss.getSheetByName(SHEET_CONFIG);
  if (!cfg) {
    cfg = ss.insertSheet(SHEET_CONFIG);
    cfg.appendRow(['chave', 'valor', 'descrição']);
    cfg.setFrozenRows(1);
    cfg.getRange('B:B').setNumberFormat('@');
    DEFAULT_CONFIG.forEach(function (r) { cfg.appendRow(r); });
  }
  return ss;
}

function readRows_(ss) {
  var values = ss.getSheetByName(SHEET_PRESENCAS).getDataRange().getDisplayValues();
  return values.slice(1).map(rowToObj_).filter(function (r) { return r.data; });
}

function rowToObj_(r) {
  return { data: String(r[0]).trim(), hora: r[1], nome: r[2], tipo: r[3], responsavel: r[4], chave: r[5] || ('a:' + normalize(r[2])), origem: r[6] };
}

function readConfig_(ss) {
  var cfg = {};
  DEFAULT_CONFIG.forEach(function (r) { cfg[r[0]] = r[1]; });
  ss.getSheetByName(SHEET_CONFIG).getDataRange().getDisplayValues().slice(1).forEach(function (r) {
    if (r[0]) cfg[String(r[0]).trim()] = String(r[1]).trim();
  });
  return cfg;
}

/* ===================== Utilidades ===================== */

function authorized_(secret) {
  var expected = PropertiesService.getScriptProperties().getProperty('CHECKIN_SECRET');
  return !!expected && secret === expected;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function diaNome_(n) {
  return ['', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'][Number(n)] || 'no dia do treino';
}
