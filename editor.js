import {EditorView, basicSetup} from 'codemirror';
import {python} from '@codemirror/lang-python';
import {keymap} from '@codemirror/view';
import {indentWithTab} from '@codemirror/commands';
import {Compartment} from '@codemirror/state';
import {HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';
export function makeEditor(parent, code, onChange, onRun) {
  const readOnly = new Compartment();
  const colors=HighlightStyle.define([{tag:tags.keyword,color:'#edb58c'},{tag:tags.string,color:'#b6d995'},{tag:tags.comment,color:'#91ad9e',fontStyle:'italic'},{tag:tags.number,color:'#d9c77d'},{tag:tags.variableName,color:'#e1ebe0'},{tag:tags.function(tags.variableName),color:'#98d5c4'},{tag:tags.operator,color:'#c2d5be'},{tag:tags.bool,color:'#c5a9d8'},{tag:tags.typeName,color:'#a6cdda'}]);
  const view = new EditorView({parent,doc:code,extensions:[basicSetup,python(),syntaxHighlighting(colors),readOnly.of(EditorView.editable.of(true)),keymap.of([{key:'Mod-Enter',run:()=>{onRun();return true;}},indentWithTab]),EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'Редактор Python','spellcheck':'false','autocapitalize':'off','autocorrect':'off'}),EditorView.updateListener.of(u=>{if(u.docChanged)onChange(u.state.doc.toString());}),EditorView.theme({
    '&':{fontSize:'14px',backgroundColor:'#172724',color:'#e3eee9',minHeight:'295px'},
    '.cm-content':{fontFamily:'Consolas, "Courier New", monospace',padding:'18px 0',caretColor:'#c9ee99',minHeight:'295px'},
    '.cm-scroller':{overflow:'auto',lineHeight:'1.8'},
    '.cm-gutters':{backgroundColor:'#172724',color:'#7e9990',border:'none',paddingRight:'10px'},
    '.cm-activeLine, .cm-activeLineGutter':{backgroundColor:'#21352f'},
    '.cm-cursor':{borderLeftColor:'#c9ee99'},
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection':{backgroundColor:'#395c4e !important'},
    '.cm-tooltip':{backgroundColor:'#263e34',color:'#f0f4f0',border:'1px solid #547363'},
    '.cm-search':{backgroundColor:'#263e34',color:'#fff'},
    '.cm-foldPlaceholder':{backgroundColor:'#3c594c',color:'#fff'}
  },{dark:true})]});
  return {view,insert:text=>{view.dispatch(view.state.replaceSelection(text));view.focus();},get:()=>view.state.doc.toString(),set:code=>view.dispatch({changes:{from:0,to:view.state.doc.length,insert:code}}),lock:value=>view.dispatch({effects:readOnly.reconfigure(EditorView.editable.of(!value))}),destroy:()=>view.destroy()};
}
