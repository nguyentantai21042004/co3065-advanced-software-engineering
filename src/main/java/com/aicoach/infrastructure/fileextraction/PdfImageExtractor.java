package com.aicoach.infrastructure.fileextraction;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;

import com.aicoach.infrastructure.ImageExtractor;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class PdfImageExtractor implements ImageExtractor {

    @Override
    public List<byte[]> extractImages(File file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file)) {
            return extractImagesFromDocument(document);
        }
    }

    @Override
    public List<byte[]> extractImages(InputStream inputStream, String fileName) throws Exception {
        byte[] fileBytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            return extractImagesFromDocument(document);
        }
    }

    @Override
    public byte[] extractFirstImage(InputStream inputStream, String fileName) throws Exception {
        log.info("Extracting first image from PDF: {}", fileName);

        byte[] fileBytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            for (PDPage page : document.getPages()) {
                PDResources resources = page.getResources();
                for (COSName name : resources.getXObjectNames()) {
                    PDXObject xObject = resources.getXObject(name);
                    if (xObject instanceof PDImageXObject) {
                        PDImageXObject imageObject = (PDImageXObject) xObject;
                        if (imageObject.getWidth() < 50 || imageObject.getHeight() < 50) {
                            continue;
                        }
                        BufferedImage bufferedImage = imageObject.getImage();
                        return convertToBytes(bufferedImage, "png");
                    }
                }
            }
            log.warn("No suitable images found in PDF: {}", fileName);
            return null;
        }
    }

    @Override
    public boolean supports(String fileName) {
        if (fileName == null) {
            return false;
        }
        return fileName.toLowerCase().endsWith(".pdf");
    }

    private List<byte[]> extractImagesFromDocument(PDDocument document) throws Exception {
        List<byte[]> images = new ArrayList<>();
        for (PDPage page : document.getPages()) {
            PDResources resources = page.getResources();
            for (COSName name : resources.getXObjectNames()) {
                PDXObject xObject = resources.getXObject(name);
                if (xObject instanceof PDImageXObject) {
                    PDImageXObject imageObject = (PDImageXObject) xObject;
                    if (imageObject.getWidth() >= 50 && imageObject.getHeight() >= 50) {
                        BufferedImage bufferedImage = imageObject.getImage();
                        images.add(convertToBytes(bufferedImage, "png"));
                    }
                }
            }
        }
        log.info("Extracted {} images from PDF", images.size());
        return images;
    }

    private byte[] convertToBytes(BufferedImage image, String format) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, format, baos);
            return baos.toByteArray();
        }
    }
}


