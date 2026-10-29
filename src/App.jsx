import { useEffect, useRef, useState } from 'react'
import { configured, supabase, regions, isAdmin, photoUrl, listDishes, saveDish, deleteDish } from './services/supabase'
import { legacyDishes, migrateLegacy } from './services/legacyMigration'
import PwaUpdate from './components/PwaUpdate'
import Brand from './components/Brand'
import Decoration from './components/Decoration'
import './App.css'

export default function App() {
  const [dishes, setDishes] = useState([])
  const [region, setRegion] = useState('Todas')
  const [query, setQuery] = useState('')
  const [session, setSession] = useState(null)
  const [manage, setManage] = useState(false)
  const [loading, setLoading] = useState(configured)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState(null)
  const [selected, setSelected] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [offline, setOffline] = useState(!navigator.onLine)
  const [install, setInstall] = useState(null)
  const dialog = useRef(null)
  const admin = isAdmin(session)
  useEffect(() => {
    if (!supabase) return
    let alive = true
    listDishes().then(data => { if (alive) setDishes(data) }).catch(() => { if (alive) setError('Não foi possível carregar o cardápio. Verifique sua conexão e a configuração do Supabase.') }).finally(() => { if (alive) setLoading(false) })
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => { alive = false; data.subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    const network = () => setOffline(!navigator.onLine)
    const prompt = e => { e.preventDefault(); setInstall(e) }
    window.addEventListener('online', network); window.addEventListener('offline', network); window.addEventListener('beforeinstallprompt', prompt)
    return () => { window.removeEventListener('online', network); window.removeEventListener('offline', network); window.removeEventListener('beforeinstallprompt', prompt) }
  }, [])
  useEffect(() => {
    if (editor || selected || removing) dialog.current?.showModal()
    else dialog.current?.close()
  }, [editor, selected, removing])
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file); setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  function close() { if (busy) return; setEditor(null); setSelected(null); setRemoving(null); setFile(null); setError('') }
  function edit(dish) { setError(''); setFile(null); setEditor(dish ? { ...dish, original_photo: dish.photo_path } : { name: '', description: '', region: region === 'Todas' ? 'Norte' : region, photo_path: null }) }
  async function refresh() { setLoading(true); setError(''); try { setDishes(await listDishes()) } catch { setError('Não foi possível atualizar o cardápio. Tente novamente.') } finally { setLoading(false) } }
  async function save(e) {
    e.preventDefault(); setError('')
    if (!editor.name.trim() || !editor.description.trim()) { setError('Preencha o nome e a descrição.'); return }
    setBusy(true)
    try { const saved = await saveDish(editor, file); setDishes(prev => editor.id ? prev.map(d => d.id === saved.id ? saved : d) : [...prev, saved]); setEditor(null); setFile(null); setNotice('Prato salvo no cardápio.') }
    catch (err) { setError(err.message || 'Não foi possível salvar. Tente novamente.') }
    finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true); setError('')
    try { await deleteDish(removing); setDishes(prev => prev.filter(d => d.id !== removing.id)); setRemoving(null); setNotice('Prato excluído.') }
    catch (err) { setError(err.message); await refresh(); setRemoving(null) }
    finally { setBusy(false) }
  }
  async function login(e) {
    e.preventDefault(); setBusy(true); setError('')
    const fields = new FormData(e.currentTarget)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: fields.get('email'), password: fields.get('password') })
      if (authError) throw new Error('E-mail ou senha inválidos.')
      if (!isAdmin(data.session)) { await supabase.auth.signOut(); throw new Error('Este usuário não tem acesso à administração.') }
      setSession(data.session)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const visible = dishes.filter(d => (region === 'Todas' || d.region === region) && `${d.name} ${d.description}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))
  const photo = dish => photoUrl(dish.photo_path)
  return <>
    <header className="site-header"><a className="wordmark" href="#" onClick={() => setManage(false)}><Brand compact/></a><div className="school">MOSTRA CULTURAL<br/><b>SENAC RECIFE · 2026</b></div><button className="text-button" onClick={() => { setManage(!manage); setError('') }}>{manage ? 'Voltar ao cardápio' : 'Administração'}</button></header>
    <main>
      <section className={`intro${manage ? ' intro-admin' : ''}`}><Decoration/><div className="intro-content">{manage ? <><Brand/><p className="intro-subtitle">Painel do administrador</p></> : <><Brand/><h1>Uma mostra cultural que celebra<br/>a diversidade gastronômica do nosso país!</h1><p>Explore os sabores de cada região do Brasil e descubra pratos típicos que representam nossa cultura, tradição e identidade.</p><a className="primary" href="#cardapio">Começar agora <span aria-hidden="true">→</span></a></>}</div></section>
      {!configured && <div className="status-box">O cardápio está aguardando a conexão com o Supabase. Preencha o arquivo <code>.env</code> e reinicie o servidor.</div>}
      {offline && <div className="status-box">Sem conexão. O aplicativo abre offline, mas a consulta e as alterações precisam de internet.</div>}
      {manage && configured && !admin ? <section className="login-panel"><p className="kicker">ÁREA DA EQUIPE</p><h2>Acessar o cadastro</h2><form onSubmit={login}><label>E-mail<input name="email" type="email" autoComplete="username" required/></label><label>Senha<input name="password" type="password" autoComplete="current-password" required/></label>{error && <p role="alert" className="error">{error}</p>}<button className="primary" disabled={busy || offline}>{busy ? 'Entrando…' : 'Entrar'}</button></form></section> : <section className="menu" id="cardapio">
        <div className="menu-heading"><h2>{manage ? 'Cadastro de pratos' : 'Nossas Regiões'}</h2><p>{manage ? 'Escolha a região para cadastrar ou editar um prato.' : 'Escolha um sabor de cada região para conhecer a culinária do nosso país.'}</p></div>
        <div className="region-tabs" aria-label="Regiões do Brasil">{['Todas', ...regions].map((name, i) => <button key={name} onClick={() => { setRegion(name); setQuery('') }} aria-pressed={region === name} className={region === name ? 'active' : ''}><small>{i === 0 ? 'BR' : `0${i}`}</small>{name === 'Todas' ? 'Todo o Brasil' : name}</button>)}</div>
        <div className="menu-tools"><div><p className="kicker">{region === 'Todas' ? 'Todo o Brasil' : region}</p><p>{manage ? (region === 'Todas' ? 'Selecione uma região para adicionar um prato.' : 'Os novos pratos serão cadastrados nesta região.') : 'Conheça os pratos da nossa mostra.'}</p></div><label className="search"><span>Buscar</span><input aria-label="Buscar prato" placeholder="Nome ou ingrediente" value={query} onChange={e => setQuery(e.target.value)}/></label>{manage && admin && <button className="primary" disabled={offline || busy || region === 'Todas'} onClick={() => edit(null)}>Adicionar prato</button>}</div>
        {manage && admin && <div className="admin-bar"><span>Conectado como {session.user.email}</span><button onClick={async () => { await supabase.auth.signOut(); setManage(false) }}>Sair</button>{legacyDishes().length > 0 && <button disabled={busy || offline} onClick={async () => { setBusy(true); setError(''); try { const count = await migrateLegacy(); await refresh(); setNotice(`${count} pratos importados do armazenamento antigo.`) } catch (err) { setError(`A importação foi interrompida: ${err.message}. Você pode tentar novamente sem duplicar os pratos já importados.`) } finally { setBusy(false) } }}> {busy ? 'Aguarde…' : 'Importar cadastros deste navegador'}</button>}</div>}
        {error && !editor && !removing && <div role="alert" className="error">{error}{configured && <button className="text-button" onClick={refresh}>Tentar novamente</button>}</div>}
        {loading ? <p className="empty" role="status">Carregando o cardápio…</p> : <div className="region-list">{regions.filter(name => region === 'Todas' || name === region).map(name => <section className="region-section" key={name}><h3 className="region-title"><span className={`region-symbol region-symbol-${regions.indexOf(name)}`} aria-hidden="true">◆</span>{name}</h3><div className="dish-grid">{visible.filter(dish => dish.region === name).map((dish, i) => <article className="dish" key={dish.id}><button className="dish-photo" onClick={() => setSelected(dish)} aria-label={`Ver ${dish.name}`}>{photo(dish) ? <img src={photo(dish)} alt={dish.name} loading="lazy"/> : <div className="photo-placeholder"><span>Brasil de<br/><b>Muitos Sabores</b></span><small>RECEITA {String(i + 1).padStart(2, '0')}</small></div>}</button><div className="dish-content"><span className="recipe-number">{dish.region}</span><h3><button onClick={() => setSelected(dish)}>{dish.name}</button></h3><p>{dish.description}</p>{manage && admin && <div className="dish-actions"><button disabled={offline || busy} onClick={() => edit(dish)}>Editar</button><button disabled={offline || busy} onClick={() => { setError(''); setRemoving(dish) }}>Excluir</button></div>}</div></article>)}</div>{!visible.some(dish => dish.region === name) && <p className="region-empty">{query ? 'Nenhum prato encontrado nesta região.' : 'Em breve, os sabores desta região.'}</p>}</section>)}</div>}

      </section>}
      <div className="closing-art"><Decoration bottom/></div>
    </main>
    <footer><span>MédioTec · SENAC Recife · 2026</span><button onClick={async () => { if (install) { await install.prompt(); setInstall(null) } else setNotice('Android: menu do navegador → Instalar aplicativo. iPhone: Safari → Compartilhar → Adicionar à Tela de Início.') }}>Adicionar à tela inicial</button></footer>
    <dialog ref={dialog} onCancel={e => { if (busy) e.preventDefault(); else close() }} onClick={e => { if (e.target === dialog.current) close() }} aria-label={editor ? 'Cadastro de prato' : removing ? 'Excluir prato' : 'Detalhes do prato'}><button className="modal-close" disabled={busy} aria-label="Fechar" onClick={close}>×</button>
      {editor && <form onSubmit={save}><p className="kicker">{editor.region}</p><h2>{editor.id ? 'Editar prato' : 'Adicionar prato'}</h2><fieldset disabled={busy}><label>Nome do prato<input autoFocus required maxLength={80} value={editor.name} onChange={e => setEditor({ ...editor, name: e.target.value })}/></label><label>Descrição<textarea required maxLength={600} rows={4} value={editor.description} onChange={e => setEditor({ ...editor, description: e.target.value })}/></label><label>Foto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const chosen = e.target.files?.[0]; if (!chosen) return; if (!['image/jpeg','image/png','image/webp'].includes(chosen.type) || chosen.size > 5242880) { setError('Use uma foto JPG, PNG ou WebP de até 5 MB.'); e.target.value = ''; return } setError(''); setFile(chosen) }}/></label><small>JPG, PNG ou WebP. Até 5 MB.</small>{(preview || photo(editor)) && <div className="photo-preview"><img src={preview || photo(editor)} alt="Prévia da foto"/><button type="button" onClick={() => { setFile(null); setEditor({ ...editor, photo_path: null }) }}>Remover foto</button></div>}</fieldset>{error && <p className="error" role="alert">{error}</p>}<div className="form-actions"><button type="button" disabled={busy} onClick={close}>Cancelar</button><button className="primary" disabled={busy || offline}>{busy ? 'Salvando…' : 'Salvar prato'}</button></div></form>}
      {selected && <div className="dish-detail">{photo(selected) && <img src={photo(selected)} alt={selected.name}/>}<p className="kicker">{selected.region}</p><h2>{selected.name}</h2><p>{selected.description}</p></div>}
      {removing && <div><p className="kicker">{removing.region}</p><h2>Excluir {removing.name}?</h2><p>O prato e sua foto serão removidos do cardápio compartilhado.</p>{error && <p className="error" role="alert">{error}</p>}<div className="form-actions"><button disabled={busy} onClick={close}>Cancelar</button><button className="primary" disabled={busy || offline} onClick={remove}>{busy ? 'Excluindo…' : 'Excluir prato'}</button></div></div>}
    </dialog>
    {notice && <div className="toast" role="status">{notice}<button aria-label="Fechar aviso" onClick={() => setNotice('')}>×</button></div>}<PwaUpdate/>
  </>
}
