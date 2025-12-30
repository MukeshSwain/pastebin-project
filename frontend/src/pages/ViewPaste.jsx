import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ViewPaste() {
  const { id } = useParams();

  useEffect(() => {
    window.location.replace(`https://pastebin-project.onrender.com/p/${id}`);
  }, [id]);

  return (
    <div className="container">
      <div className="card">
        <p>Loading paste…</p>
      </div>
    </div>
  );
}
