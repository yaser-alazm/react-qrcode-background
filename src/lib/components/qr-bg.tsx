import React, {useState} from 'react'
import {_useLibStateCallback} from '../hooks'

interface Props {
  qrCodeElRef: React.MutableRefObject<any>
}
export const QRBg = (props: Props) => {
  const {qrCodeElRef} = props

  const [QRCodeImg, setQRCodeImg] = _useLibStateCallback('')
  const [qrBgImg, setQRBgImg] = useState('')
  const [qrImgReady, setQRImgReady] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)
  const [uploadedImg, setUploadedImg] = useState(false)

  const getQrCodeImg = async (upload?: boolean, img?: string) => {
    let serialized = new XMLSerializer().serializeToString(
      await qrCodeElRef.current.children[0]
    )
    const parser = new DOMParser()
    const newSvg = parser.parseFromString(serialized, 'image/svg+xml')
    const newSvgEl = newSvg.firstChild as SVGSVGElement
    let qrCodeImgSrc =
      'data:image/svg+xml;base64,' +
      encodeURIComponent(window.btoa(newSvgEl.outerHTML))

    if (img && qrCodeImgSrc && qrCodeImgSrc.length > 0) {
      setQRCodeImg(qrCodeImgSrc, (qrCodeImg: string) => {
        if (upload === true) {
          generateQrBgImage(img, qrCodeImg)
        } else if (upload === false) {
          regenerateBGImg(img, qrCodeImg)
        }
        setQRImgReady(true)
      })
    }
  }

  const generateQrBgImage = (bgImg: string, qrImg: string) => {
    let img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = bgImg
    let imgWidth = 0
    let imgHeight = 0
    img.onload = () => {
      imgWidth = img.width
      imgHeight = img.height

      let qrCode = new Image()
      img.crossOrigin = 'Anonymous'
      qrCode.src = qrImg
      let qrCodeWidth = 0

      let canvas = document.createElement('canvas')
      canvas.width = imgWidth
      canvas.height = imgHeight
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

      // draw first image on created canvas element
      if (ctx) {
        ctx.drawImage(img, 0, 0)

        qrCode.onload = () => {
          qrCodeWidth = qrCode.width
          // draw second image on created canvas element
          ctx.drawImage(
            qrCode,
            imgWidth - qrCodeWidth - (3 * qrCodeWidth) / 4,
            qrCodeWidth / 2
          )

          let img = canvas.toDataURL('image/*')

          setQRBgImg(img)
          setDownloadReady(true)
        }
      }
    }
  }

  const regenerateBGImg = (img: string, qrCode: string) => {
    if (img.startsWith('data:')) {
      setDownloadReady(false)
      generateQrBgImage(img, qrCode)
    } else {
      setDownloadReady(false)
      generateQrBgImage(img, qrCode)
    }
  }

  const onImgClickHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let imgIdx = Number(e)
    let src: string
    src = imgWithTimestamp(BGPreviewImgsVC[imgIdx])
    if (uploadedImg) {
      // regenerate code size dynamically for sample images after coming from custom uploading process
      let bgImg = new Image()
      bgImg.crossOrigin = 'Anonymous'
      let bgImgWidth = 0
      let percentage = QRPercent
      bgImg.src = src

      bgImg.onload = () => {
        bgImgWidth = bgImg.width
        setQrImgSize((bgImgWidth * percentage) / 100, async (size: number) => {
          await getQrCodeImg(false, src)
        })
        setUploadedImg(false)
      }
    } else {
      regenerateBGImg(src, QRCodeImg)
    }
  }
  return <div>qr-bg</div>
}
