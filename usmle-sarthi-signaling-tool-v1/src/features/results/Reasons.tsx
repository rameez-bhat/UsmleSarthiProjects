function Reasons({
  title,
  items = []
}: any) {

  return (

    <div className="card">

      <h3>
        {title}
      </h3>


      {
        items.length

          ? items.map(
              (
                item: any,
                index: number
              ) => (

                <p key={index}>
                  • {item}
                </p>

              )
            )

          : (

            <p className="muted">
              None
            </p>

          )
      }

    </div>

  );

}

export default Reasons;
