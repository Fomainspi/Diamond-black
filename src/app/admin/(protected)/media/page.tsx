import {getPrismaClient} from "@/lib/prisma";
import {uploadMedia,deleteMedia} from "@/app/admin/(protected)/media-actions";
import ConfirmDelete from "../confirm-delete";
export default async function Media(){
 const assets=await getPrismaClient().mediaAsset.findMany({orderBy:{createdAt:"desc"}});
 return <><span className="eyebrow">Assets</span><h1>Media library</h1><p className="admin-muted">JPEG, PNG, WebP and GIF images up to 5 MB. The uploads volume is persistent and must be included in backups.</p>
 <form className="admin-form admin-panel" action={uploadMedia}><label>Choose image<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" required/></label><label>Alternative text<input name="altText" maxLength={300}/></label><button className="admin-button">Upload image</button></form>
 <div className="admin-grid">{assets.map(asset=><div className="admin-panel" key={asset.id}><img src={asset.url} alt={asset.altText??asset.originalName} style={{width:"100%",height:150,objectFit:"cover"}}/><p>{asset.originalName}</p><small>{Math.round(asset.size/1024)} KB · {asset.mimeType}</small><p><a className="admin-link" href={asset.url} target="_blank" rel="noreferrer">Open asset</a></p><ConfirmDelete action={deleteMedia} prompt="Delete this media file? It will be blocked if used by content or events."><input type="hidden" name="id" value={asset.id}/><button className="admin-link">Delete media</button></ConfirmDelete></div>)}</div>
 {!assets.length&&<p className="admin-empty">No media uploaded yet.</p>}</>;
}