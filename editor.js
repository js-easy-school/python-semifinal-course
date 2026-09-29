import {EditorView, basicSetup} from 'codemirror';
import {python} from '@codemirror/lang-python';
import {keymap} from '@codemirror/view';
import {indentWithTab} from '@codemirror/commands';
import {Compartment} from '@codemirror/state';
import {HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';
export function makeEditor(parent, code, onChange, onRun) {
  const readOnly = new Compartment();
  const colors=HighlightStyle.define([{tag:tags.keyword,color:'var(--syn-keyword)'},{tag:tags.string,color:'var(--syn-string)'},{tag:tags.comment,color:'var(--syn-comment)',fontStyle:'italic'},{tag:tags.number,color:'var(--syn-number)'},{tag:tags.variableName,color:'var(--syn-variable)'},{tag:tags.function(tags.variableName),color:'var(--syn-function)'},{tag:tags.operator,color:'var(--syn-operator)'},{tag:tags.bool,color:'var(--syn-bool)'},{tag:tags.typeName,color:'var(--syn-type)'}]);
  const view = new EditorView({parent,doc:code,extensions:[basicSetup,python(),syntaxHighlighting(colors),readOnly.of(EditorView.editable.of(true)),keymap.of([{key:'Mod-Enter',run:()=>{onRun();return true;}},indentWithTab]),EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'Редактор Python','spellcheck':'false','autocapitalize':'off','autocorrect':'off'}),EditorView.updateListener.of(u=>{if(u.docChanged)onChange(u.state.doc.toString());}),EditorView.theme({
    '&':{fontSize:'14px',backgroundColor:'var(--editor-bg)',color:'var(--editor-text)',minHeight:'295px'},
    '.cm-content':{fontFamily:'Consolas, "Courier New", monospace',padding:'18px 0',caretColor:'var(--editor-caret)',minHeight:'295px'},
    '.cm-scroller':{overflow:'auto',lineHeight:'1.8'},
    '.cm-gutters':{backgroundColor:'var(--editor-bg)',color:'var(--editor-gutter)',border:'none',paddingRight:'10px'},
    '.cm-activeLine, .cm-activeLineGutter':{backgroundColor:'var(--editor-active)'},
    '.cm-cursor':{borderLeftColor:'var(--editor-caret)'},
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection':{backgroundColor:'var(--editor-selection) !important'},
    '.cm-tooltip':{backgroundColor:'var(--editor-panel)',color:'var(--editor-text)',border:'1px solid var(--editor-panel-line)'},
    '.cm-search':{backgroundColor:'var(--editor-panel)',color:'var(--editor-text)'},
    '.cm-foldPlaceholder':{backgroundColor:'var(--editor-fold)',color:'var(--editor-text)'}
  },{dark:true})]});
  return {view,insert:text=>{view.dispatch(view.state.replaceSelection(text));view.focus();},get:()=>view.state.doc.toString(),set:code=>view.dispatch({changes:{from:0,to:view.state.doc.length,insert:code}}),lock:value=>view.dispatch({effects:readOnly.reconfigure(EditorView.editable.of(!value))}),destroy:()=>view.destroy()};
}
