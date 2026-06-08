import{c as i,r,j as e,b as x}from"./index-DQn6AS0e.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=i("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=i("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=i("QrCode",[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]]),k=({item:t})=>{const[n,c]=r.useState(null),[h,l]=r.useState(!0),[d,o]=r.useState(null);r.useEffect(()=>{const a=async()=>{try{l(!0);const s=await x.get(`/api/qr/generate/${t._id}`);s.data.success?c(s.data.data):o(s.data.message)}catch(s){console.error("Failed to retrieve QR code:",s.message),o("Failed to load QR code image")}finally{l(!1)}};t&&t._id&&a()},[t]);const p=()=>{if(!n||!n.qrCodeDataURL)return;const a=document.createElement("a");a.href=n.qrCodeDataURL,a.download=`${t.itemName.replace(/\s+/g,"_")}_QR_label.png`,document.body.appendChild(a),a.click(),document.body.removeChild(a)},y=()=>{const a=window.open("","_blank");a.document.write(`
      <html>
        <head>
          <title>Print QR Label</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            img { width: 250px; height: 250px; }
            h2 { margin-bottom: 5px; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>${t.itemName}</h2>
          <p>Serial: ${t.serialNumber||"N/A"}</p>
          <img src="${n.qrCodeDataURL}" alt="QR code" />
          <p style="font-size: 11px; margin-top: 10px;">Token: ${t.qrCodeToken}</p>
        </body>
      </html>
    `),a.document.close()};return h?e.jsx("div",{className:"glass-panel",style:{padding:"1.5rem",textAlign:"center",minHeight:"220px",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxs("div",{children:[e.jsx(f,{size:32,className:"gradient-text",style:{animation:"pulse 1.5s infinite"}}),e.jsx("p",{style:{color:"#94a3b8",fontSize:"0.85rem",marginTop:"0.5rem"},children:"Generating QR Label..."})]})}):d||!n?e.jsx("div",{className:"glass-panel",style:{padding:"1.5rem",textAlign:"center",color:"#ef4444"},children:e.jsx("p",{children:d||"Failed to render QR Code"})}):e.jsxs("div",{className:"glass-panel",style:{padding:"1.5rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem",maxWidth:"320px",margin:"0 auto"},children:[e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("h3",{style:{fontSize:"1rem",color:"#ffffff",marginBottom:"0.25rem"},children:t.itemName}),e.jsx("span",{className:"status-badge status-stolen",style:{fontSize:"0.65rem"},children:"STOLEN LABEL"})]}),e.jsx("div",{style:{background:"#ffffff",padding:"1rem",borderRadius:"12px",boxShadow:"0 4px 10px rgba(0, 0, 0, 0.4)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("img",{src:n.qrCodeDataURL,alt:"Item QR Code",style:{width:"180px",height:"180px",display:"block"}})}),e.jsxs("div",{style:{width:"100%",fontSize:"0.75rem",color:"#94a3b8",textAlign:"center"},children:[e.jsxs("p",{style:{fontFamily:"monospace",wordBreak:"break-all"},children:["Token: ",t.qrCodeToken]}),t.serialNumber&&e.jsxs("p",{style:{marginTop:"0.25rem"},children:["S/N: ",t.serialNumber]})]}),e.jsxs("div",{style:{display:"flex",gap:"0.75rem",width:"100%"},children:[e.jsxs("button",{onClick:p,className:"btn btn-secondary",style:{flex:1,padding:"0.5rem",fontSize:"0.8rem"},children:[e.jsx(m,{size:14}),e.jsx("span",{children:"Save"})]}),e.jsxs("button",{onClick:y,className:"btn btn-secondary",style:{flex:1,padding:"0.5rem",fontSize:"0.8rem"},children:[e.jsx(g,{size:14}),e.jsx("span",{children:"Print"})]})]})]})};export{f as Q,k as a};
