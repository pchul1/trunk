<%@page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@page import="java.io.ByteArrayOutputStream"%>
<%@page import="javax.imageio.ImageIO"%>
<%@page import="java.io.ByteArrayInputStream"%>
<%@page import="sun.misc.BASE64Decoder"%>
<%@page import="java.awt.image.BufferedImage"%>


<%
	response.setHeader("Access-Control-Allow-Origin","*");
	response.setHeader("Access-Control-Allow-Headers", "origin, x-requested-with, content-type, accept");
	try{
		String image = request.getParameter("_imageData_");
		String fileName = request.getParameter("_imageFileName_");
			
		image = image.replace(";base64,", "");
		
		response.setContentType("image/png");
		response.setHeader("Content-Disposition","attachment; filename="+fileName+".png;");
		out.clear();
		out = pageContext.pushBody();
		byte[] image2 = decodeToImage(image);
		response.setContentLength(image2.length);
		
		ServletOutputStream oout = response.getOutputStream();
		oout.write(image2);
		oout.flush();
		oout.close();
		
	}catch(Exception e){
		//out.println(e);
		e.printStackTrace();
	}
%>
<%!
public static byte[] decodeToImage(String imageString) {
	 
    BufferedImage image = null;
    byte[] imageByte = null;
    try {
        BASE64Decoder decoder = new BASE64Decoder();
        imageByte = decoder.decodeBuffer(imageString);
    } catch (Exception e) {
        e.printStackTrace();
    }
    return imageByte;
}
%>