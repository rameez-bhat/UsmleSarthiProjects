function Metric({
  title,
  value
}: any) {

  return (

    <div className="card metric">

      <small>
        {title}
      </small>

      <b>
        {value || '—'}
      </b>

    </div>

  );

}




export default Metric;
