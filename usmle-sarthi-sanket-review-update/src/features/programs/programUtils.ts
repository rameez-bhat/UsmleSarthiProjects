function getProgramName(
  p: any
) {

  return (

    p.HName ||

    p.HospitalName ||

    p.ProgramName ||

    p.program_name ||

    p.name ||

    (
      p.hospital &&
      p.hospital.HName
    ) ||

    (
      p.Frieda
        ? `FREIDA ${p.Frieda}`
        : 'Unnamed program'
    )

  );

}


function getProgramCity(
  p: any
) {

  return (

    p.City ||

    p.city ||

    (
      p.hospital &&
      p.hospital.City
    ) ||

    ''

  );

}


function getProgramState(
  p: any
) {

  return (

    p.State ||

    p.state ||

    (
      p.hospital &&
      p.hospital.State
    ) ||

    ''

  );

}


/*
 * Program selection
 */


export { getProgramName, getProgramCity, getProgramState };
