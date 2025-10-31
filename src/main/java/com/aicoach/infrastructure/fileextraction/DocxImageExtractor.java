package com.aicoach.infrastructure.fileextraction;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFPictureData;
import org.springframework.stereotype.Component;

import com.aicoach.infrastructure.ImageExtractor;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class DocxImageExtractor implements ImageExtractor {

    @Override
    public List<byte[]> extractImages(File file) throws Exception {
        try (FileInputStream fis = new FileInputStream(file);
                XWPFDocument document = new XWPFDocument(fis)) {
            return extractImagesFromDocument(document);
        }
    }

    @Override
    public List<byte[]> extractImages(InputStream inputStream, String fileName) throws Exception {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            return extractImagesFromDocument(document);
        }
    }

    @Override
    public byte[] extractFirstImage(InputStream inputStream, String fileName) throws Exception {
        log.info("Extracting first image from DOCX: {}", fileName);

        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            List<XWPFPictureData> pictures = document.getAllPictures();

            if (pictures.isEmpty()) {
                log.warn("No images found in DOCX: {}", fileName);
                return null;
            }

            XWPFPictureData picture = pictures.get(0);
            byte[] imageBytes = picture.getData();
            log.info("Extracted first image from DOCX: type={}, size={} bytes",
                    picture.getPictureType(), imageBytes.length);
            return imageBytes;
        }
    }

    @Override
    public boolean supports(String fileName) {
        if (fileName == null) {
            return false;
        }
        String lowerCase = fileName.toLowerCase();
        return lowerCase.endsWith(".docx");
    }

    private List<byte[]> extractImagesFromDocument(XWPFDocument document) {
        List<byte[]> images = new ArrayList<>();
        List<XWPFPictureData> pictures = document.getAllPictures();
        for (XWPFPictureData picture : pictures) {
            images.add(picture.getData());
            log.debug("Extracted image: type={}, size={} bytes",
                    picture.getPictureType(), picture.getData().length);
        }
        log.info("Extracted {} images from DOCX", images.size());
        return images;
    }
}


