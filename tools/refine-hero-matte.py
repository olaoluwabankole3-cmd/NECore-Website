"""Generate a true alpha matte from the original 670x460 NECore art.
Keep the original RGB artwork unchanged. Only refine its subject boundary.
Run with Pillow, numpy and opencv-python-headless.
"""
from pathlib import Path
from PIL import Image
import cv2
import numpy as np
import base64, io

root=Path(__file__).resolve().parent.parent
im=np.asarray(Image.open(root/'assets/toon-base-clean-v6.webp').convert('RGB'))
h,w=im.shape[:2]
assert (w,h)==(670,460)
# Prior is deliberately generous at face and hair; actual pixel segmentation
# determines the boundary within a narrow uncertainty band.
points=np.array([
(0,344),(15,324),(36,311),(57,302),(91,294),(130,286),(152,273),(173,260),(181,265),
(190,208),(179,200),(169,190),(159,176),(150,160),(146,145),(146,130),(149,116),
(153,103),(160,87),(170,70),(182,54),(197,40),(218,29),(240,23),(260,19),(283,21),
(306,25),(326,34),(343,41),(355,53),(362,70),(360,87),(354,105),
(357,117),(360,133),(365,145),(361,154),(360,164),(365,177),(365,187),
(361,193),(355,198),(353,207),(350,223),(346,240),(337,256),(325,267),
(315,274),(300,274),(299,297),(321,314),(345,329),(369,340),(404,357),
(428,373),(439,390),(441,459),(0,459)
],np.int32)
prior=np.zeros((h,w),np.uint8)
cv2.fillPoly(prior,[points],255)
kernel=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(19,19))
inner=cv2.erode(prior,kernel)
outer=cv2.dilate(prior,kernel)
labels=np.full((h,w),cv2.GC_BGD,np.uint8)
labels[outer>0]=cv2.GC_PR_BGD
labels[prior>0]=cv2.GC_PR_FGD
labels[inner>0]=cv2.GC_FGD
# Within the outer facial contour warm original skin is certain foreground,
# while the dark blue background must not enter the face matte.
yy,xx=np.mgrid[:h,:w]
r,g,b=im.astype(np.int16).transpose(2,0,1)
skin_zone=(xx>=328)&(xx<402)&(yy>=104)&(yy<=274)
skin=(r-b>25)&(r-g>7)&skin_zone
blue=(b-r>27)&skin_zone
labels[skin]=cv2.GC_FGD
labels[blue & (inner==0)]=cv2.GC_BGD
# Hair left/back: remove saturated blue background outside dark curls.
hair_zone=(xx>=130)&(xx<=201)&(yy>=72)&(yy<=211)
blue_fringe=(b-r>35)&(b-g>12)&(b>95)&hair_zone&(inner==0)
labels[blue_fringe]=cv2.GC_PR_BGD
cv2.grabCut(cv2.cvtColor(im,cv2.COLOR_RGB2BGR),labels,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),5,cv2.GC_INIT_WITH_MASK)
mask=np.where((labels==cv2.GC_FGD)|(labels==cv2.GC_PR_FGD),255,0).astype(np.uint8)
# Only retain the connected portrait. Fill tiny holes (e.g. reflections
# or dark facial features) without adding any background island.
n,components,stats,_=cv2.connectedComponentsWithStats(mask,8)
mask=np.where(components==1+np.argmax(stats[1:,cv2.CC_STAT_AREA]),255,0).astype(np.uint8)
contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
cv2.drawContours(mask,contours,-1,255,cv2.FILLED)
# Gentle subpixel edge, not a big elliptical fade. Fade only the bottom torso.
mask=cv2.GaussianBlur(mask,(3,3),.55).astype(np.float32)/255
fade=np.clip((460-yy)/57,0,1)
mask=(mask*fade*255).round().astype(np.uint8)
alpha=Image.fromarray(mask)
out=io.BytesIO(); alpha.save(out,format='PNG',optimize=True)
# PNG alpha matte as a transparent white image for CSS mask-image.
matte=Image.new('RGBA',(w,h),(255,255,255,0));matte.putalpha(alpha)
buf=io.BytesIO();matte.save(buf,format='PNG',optimize=True)
print('NECORE_MATTE_BASE64='+base64.b64encode(buf.getvalue()).decode(),flush=True)
# Compose the source pixels on the actual dark hero color for visual QA.
art=Image.fromarray(im).convert('RGBA');art.putalpha(alpha)
bg=Image.new('RGBA',(w,h),'#122e4d');bg.alpha_composite(art)
# JPEG avoids huge logs while retaining the head/profile for review.
head=bg.crop((130,8,407,300)).convert('RGB');head=head.resize((554,584),Image.Resampling.LANCZOS)
buf=io.BytesIO();head.save(buf,format='JPEG',quality=91,optimize=True)
print('NECORE_FACE_QA_BASE64='+base64.b64encode(buf.getvalue()).decode(),flush=True)
