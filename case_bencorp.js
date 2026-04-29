
// CASE TÉCNICO BENCORP


// EXERCÍCIO 1 — Conversão de datas


// Converte data americana (MM-DD-AAAA) para formato brasileiro
// Retorna objeto com: formatted (DD/MM/AAAA) e extensive (por extenso)
function convertDate(dateStr) {
  const mesesPorExtenso = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error('Data inválida: precisa ser uma string no formato MM-DD-AAAA');
  }

  const partes = dateStr.split('-');
  if (partes.length !== 3) {
    throw new Error('Data inválida: formato esperado é MM-DD-AAAA');
  }

  const mes = parseInt(partes[0], 10);
  const dia = parseInt(partes[1], 10);
  const ano = parseInt(partes[2], 10);

  if (isNaN(mes) || isNaN(dia) || isNaN(ano)) {
    throw new Error('Data inválida: mês, dia e ano precisam ser números válidos');
  }

  if (mes < 1 || mes > 12) {
    throw new Error('Data inválida: mês deve estar entre 01 e 12');
  }

  if (dia < 1 || dia > 31) {
    throw new Error('Data inválida: dia deve estar entre 01 e 31');
  }

  // Cria Date usando GMT local
  const dataObj = new Date(ano, mes - 1, dia);

  // Valida se a data realmente existe
  if (dataObj.getFullYear() !== ano ||
      dataObj.getMonth() !== mes - 1 ||
      dataObj.getDate() !== dia) {
    throw new Error('Data inválida: esse dia não existe nesse mês/ano');
  }

  // Formata DD/MM/AAAA
  const diaFormatado = String(dia).padStart(2, '0');
  const mesFormatado = String(mes).padStart(2, '0');
  const formatted = `${diaFormatado}/${mesFormatado}/${ano}`;

  // Monta por extenso
  const mesExtenso = mesesPorExtenso[mes - 1];
  const extensive = `${dia} de ${mesExtenso} de ${ano}`;

  return {
    formatted: formatted,
    extensive: extensive
  };
}


// EXERCÍCIO 2 — Correção do bug das clínicas duplicadas

// Separa as clínicas em 3 grupos por distância
// BUG CORRIGIDO: antes tinha 3 IFs independentes e as clínicas apareciam duplicadas
function saveNearClinics(clinics, localization) {
  let ids10 = [];
  let ids30 = [];
  let ids50 = [];

  clinics.forEach(hit => {
    var clinic = null;
    clinic = br.com.bencorp.prestador.Clinica._get({ "_id": hit.clinica._id });

    try {
      if (clinic.empresaPessoa &&
        clinic.empresaPessoa.addresses &&
        clinic.empresaPessoa.addresses.length > 0 &&
        clinic.empresaPessoa.addresses[0].coordinates) {
          if (localization && localization.coordinates &&
            clinic.empresaPessoa.addresses[0].coordinates) {

              const distance = distanceInKM(
                localization.coordinates,
                clinic.empresaPessoa.addresses[0].coordinates
              );

              const clinicData = {
                'codigoSoc': clinic.codigoNoSOC,
                'id': clinic._id,
                'tipoDeAtendimento': clinic.informacoesDeAtendimento.tipoDoAtendimento,
                'pagamentoAntecipado': clinic.informacoesDeAtendimento.pagamentoAntecipado
              };

              // Cada clínica vai pra apenas um array
              if (distance <= 10) {
                ids10.push(clinicData);
              } else if (distance <= 30) {
                ids30.push(clinicData);
              } else if (distance <= 50) {
                ids50.push(clinicData);
              }
          }
      }
    } catch (e) {
      throw _utils.stringifyAsJson(e);
    }
  });

  pin.clinicasA10Km = ids10;
  pin.clinicasA30Km = ids30;
  pin.clinicasA50Km = ids50;

  return {
    "clinicasA10Km": pin.clinicasA10Km,
    "clinicasA30Km": pin.clinicasA30Km,
    "clinicasA50Km": pin.clinicasA50Km
  };
}

// EXEMPLOS DE USO

// Exercício 1
const resultado = convertDate('04-29-2026');
console.log(resultado.formatted);   // 29/04/2026
console.log(resultado.extensive);   // 29 de abril de 2026

// Exercício 2
// O bug era que os IFs eram independentes, então uma clínica de 8km entrava em ids10, ids30 E ids50 ao mesmo tempo
// Agora com if-else if-else cada clínica vai pra um único array
