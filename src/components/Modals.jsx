/** @file Janelas (modais) do protótipo: Convidar, Termos, Cidade, Reportar, Denunciar e Plano Organizador. */
import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { findActivity, reportActivity, reportPerson } from "../services/rules.js";
import { Modal } from "./ui.jsx";

const INVITE_URL = "https://meleva.app/convite/mariana";

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* navegador sem permissão: o aviso aparece mesmo assim (protótipo) */
  }
}

function Invite({ onClose, props }) {
  const { toast } = useStore();
  const url = props.url ?? INVITE_URL;
  const text = props.text ?? "Bora treinar junto? Entra no Me Leva:";
  return (
    <Modal title={props.title ?? "Chame a galera pro Me Leva"} onClose={onClose}>
      <p className="modal__lead">{props.lead ?? "Quanto mais gente perto, mais atividades. Compartilhe seu link de convite."}</p>
      <div className="copy-field">
        <span>{Icon.link}</span>
        <input readOnly value={url} aria-label="Link de convite" onFocus={(e) => e.target.select()} />
        <button className="btn btn--gradient btn--sm" type="button" onClick={() => copy(url).then(() => toast("Link copiado!"))}>
          Copiar
        </button>
      </div>
      <div className="share-row">
        <a
          className="share-btn share-btn--whatsapp"
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => toast("Abrindo o WhatsApp")}
        >
          {Icon.whatsapp} WhatsApp
        </a>
        <button className="share-btn share-btn--instagram" type="button" onClick={() => copy(url).then(() => toast("Link copiado! Cole no seu story do Instagram"))}>
          {Icon.instagram} Instagram
        </button>
        <a className="share-btn" href={`mailto:?subject=${encodeURIComponent("Bora pro Me Leva?")}&body=${encodeURIComponent(`${text} ${url}`)}`}>
          {Icon.mail} E-mail
        </a>
      </div>
    </Modal>
  );
}

function Terms({ onClose }) {
  return (
    <Modal title="Termos de uso e privacidade" onClose={onClose} wide footer={<button className="btn btn--gradient" type="button" onClick={onClose}>Entendi</button>}>
      <div className="terms">
        <h3>1. O que é o Me Leva</h3>
        <p>Um site que conecta pessoas de Teresópolis para praticar atividades físicas juntas. Participar e organizar é sempre gratuito.</p>
        <h3>2. Seus dados (LGPD)</h3>
        <p>Coletamos só o necessário: nome, e-mail, celular, cidade, idade, esportes, nível e disponibilidade. Sua localização exata nunca aparece para outras pessoas. Você escolhe o que é público e pode excluir a conta e os dados quando quiser.</p>
        <h3>3. Segurança</h3>
        <p>O endereço exato do ponto de encontro, a lista de quem vai e o chat ficam visíveis só para quem confirmou presença. Prefira encontros em locais públicos e avise um contato de confiança.</p>
        <h3>4. Regras da comunidade</h3>
        <p>Custos, inscrições ou divulgação de marca precisam estar na descrição. Atividades que não seguirem isso podem ser reportadas e removidas. Assédio e discriminação geram suspensão.</p>
        <h3>5. Denúncias</h3>
        <p>A denúncia é anônima para a pessoa denunciada e gera um protocolo com data, hora e local, que pode apoiar um boletim de ocorrência. Em perigo? Ligue 190.</p>
      </div>
    </Modal>
  );
}

function City({ onClose }) {
  const { toast } = useStore();
  const [query, setQuery] = useState("");
  const cities = ["Teresópolis", "Petrópolis", "Nova Friburgo", "Rio de Janeiro", "Guapimirim"];
  const list = cities.filter((c) => c.toLowerCase().includes(query.toLowerCase()));
  return (
    <Modal title="Escolha sua cidade" onClose={onClose}>
      <label className="field">
        <span className="sr-only">Buscar cidade</span>
        <span className="field__box">
          <span className="field__icon">{Icon.search}</span>
          <input placeholder="Buscar cidade" value={query} onChange={(e) => setQuery(e.target.value)} />
        </span>
      </label>
      <ul className="city-list">
        {list.map((city) =>
          city === "Teresópolis" ? (
            <li key={city}>
              <button type="button" className="city city--active" onClick={onClose}>
                {Icon.pin} {city}, RJ <span className="tag tag--green">Ativa</span>
              </button>
            </li>
          ) : (
            <li key={city}>
              <button type="button" className="city" onClick={() => toast(`Vamos te avisar quando chegar em ${city}`)}>
                {Icon.pin} {city}, RJ <span className="tag tag--lilac">Em breve</span>
              </button>
            </li>
          ),
        )}
      </ul>
      <p className="hint">O Me Leva começa por Teresópolis para juntar mais gente perto de você.</p>
    </Modal>
  );
}

const ACTIVITY_REASONS = [
  "Cobrança ou evento pago sem aviso",
  "Venda ou divulgação de marca sem aviso",
  "Local diferente do combinado",
  "A atividade não aconteceu",
  "Conteúdo ofensivo ou impróprio",
];

function ReportActivity({ onClose, props }) {
  const { state, run, toast } = useStore();
  const activity = findActivity(state, props.activityId);
  const [reasons, setReasons] = useState([]);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const { result } = run(reportActivity, { activityId: activity.id, reasons, story });
    if (result === "invalid") return setError("Escolha pelo menos um motivo.");
    toast(`Atividade reportada • protocolo ${result}`);
    onClose();
  }

  return (
    <Modal title="Reportar esta atividade" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <p className="modal__lead">
          {activity.title}. O organizador recebe um alerta e pode ser suspenso se repetir. Você não é identificado.
        </p>
        <fieldset className="checks">
          <legend>O que aconteceu?</legend>
          {ACTIVITY_REASONS.map((reason) => (
            <label key={reason} className="check">
              <input
                type="checkbox"
                checked={reasons.includes(reason)}
                onChange={() => setReasons((r) => (r.includes(reason) ? r.filter((x) => x !== reason) : [...r, reason]))}
              />
              {reason}
            </label>
          ))}
        </fieldset>
        <label className="field">
          <span>Conte mais (opcional)</span>
          <textarea className="textarea" rows={3} value={story} onChange={(e) => setStory(e.target.value)} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal__actions">
          <button className="btn btn--lilac" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn btn--gradient" type="submit">Enviar report</button>
        </div>
      </form>
    </Modal>
  );
}

const PERSON_REASONS = ["Assédio ou comentário inapropriado", "Comportamento agressivo", "Perfil falso", "Me senti insegura(o)", "Outro motivo"];

function ReportPerson({ onClose, props }) {
  const { state, run, toast, user } = useStore();
  const activity = props.activityId ? findActivity(state, props.activityId) : null;
  const options = activity ? activity.participants.filter((id) => id !== "me") : [];
  const [personId, setPersonId] = useState(props.personId ?? "");
  const [reason, setReason] = useState("");
  const [story, setStory] = useState("");
  const [block, setBlock] = useState(true);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!personId || !reason) return setError("Escolha a pessoa e o motivo.");
    const { result } = run(reportPerson, { personId, reason, story, activityId: activity?.id, block });
    toast(`Denúncia enviada • protocolo ${result}`);
    onClose();
    if (block && props.afterBlock) props.afterBlock();
  }

  return (
    <Modal title={props.personId ? `Denunciar ${user(props.personId).firstName}` : "Denunciar alguém do grupo"} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <p className="alert alert--danger">
          {Icon.phone} Está em perigo agora? <a href="tel:190"><strong>Ligue 190</strong></a>
        </p>
        {!props.personId && (
          <fieldset className="person-pick">
            <legend>Quem?</legend>
            {options.map((id) => (
              <label key={id} className={personId === id ? "person-pick__item is-active" : "person-pick__item"}>
                <input type="radio" name="person" value={id} checked={personId === id} onChange={() => setPersonId(id)} />
                <img src={user(id).avatar} alt="" />
                {user(id).firstName}
              </label>
            ))}
          </fieldset>
        )}
        <label className="field">
          <span>Motivo</span>
          <select className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Escolha um motivo</option>
            {PERSON_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>O que aconteceu?</span>
          <textarea className="textarea" rows={3} value={story} onChange={(e) => setStory(e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} />
          Bloquear essa pessoa (ela deixa de ver seu perfil e suas atividades)
        </label>
        <p className="hint">A denúncia é anônima. Você recebe um protocolo por e-mail com data, hora e local da atividade.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal__actions">
          <button className="btn btn--lilac" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn btn--gradient" type="submit">Enviar denúncia</button>
        </div>
      </form>
    </Modal>
  );
}

function Plan({ onClose }) {
  const { toast } = useStore();
  return (
    <Modal title="Plano Organizador" onClose={onClose}>
      <span className="tag tag--lilac">Em breve</span>
      <p className="modal__lead">Para quem organiza eventos pagos ou divulga marcas. No MVP, todas as atividades são gratuitas.</p>
      <div className="plans">
        <div className="plan">
          <strong>Atividade paga</strong>
          <span className="plan__price">R$ 9,90</span>
          <small>por atividade publicada</small>
        </div>
        <div className="plan">
          <strong>Patrocinada</strong>
          <span className="plan__price">R$ 29,90</span>
          <small>com destaque e selo</small>
        </div>
      </div>
      <ul className="ticks">
        <li>{Icon.check} Preço visível antes de entrar</li>
        <li>{Icon.check} Selos "Pago" e "Patrocinado"</li>
        <li>{Icon.check} Perfil verificado com documento</li>
      </ul>
      <div className="modal__actions">
        <button className="btn btn--gradient" type="button" onClick={() => { toast("Vamos te avisar"); onClose(); }}>
          Quero ser avisado
        </button>
      </div>
    </Modal>
  );
}

function Confirm({ onClose, props }) {
  return (
    <Modal title={props.title} onClose={onClose}>
      <p className="modal__lead">{props.text}</p>
      <div className="modal__actions">
        <button className="btn btn--lilac" type="button" onClick={onClose}>Voltar</button>
        <button className="btn btn--gradient" type="button" onClick={() => { props.onConfirm(); onClose(); }}>
          {props.confirmLabel ?? "Confirmar"}
        </button>
      </div>
    </Modal>
  );
}

const MODALS = {
  convidar: Invite,
  termos: Terms,
  cidade: City,
  reportar: ReportActivity,
  denunciar: ReportPerson,
  plano: Plan,
  confirmar: Confirm,
};

export default function ModalHost() {
  const { modal, closeModal } = useStore();
  if (!modal) return null;
  const Component = MODALS[modal.name];
  return Component ? <Component onClose={closeModal} props={modal.props} /> : null;
}
