FasdUAS 1.101.10   ��   ��    k             l      ��  ��   �� 
Copyright (c) The JAP-Team, JonDos GmbHAll rights reserved.Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.    * Redistributions in binary form must reproduce the above copyright notice,       this list of conditions and the following disclaimer in the documentation and/or       other materials provided with the distribution.    * Neither the name of the University of Technology Dresden, Germany, nor the name of       the JonDos GmbH, nor the names of their contributors may be used to endorse or       promote products derived from this software without specific prior written permission.THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOTLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FORA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS ORCONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, ORPROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OFLIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDINGNEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THISSOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   
  * JonDoFox profile installation script for Mac OS X
  * 2007 by Simon Pecher, JonDos GmbH 
       � 	 	   
 C o p y r i g h t   ( c )   T h e   J A P - T e a m ,   J o n D o s   G m b H   A l l   r i g h t s   r e s e r v e d .   R e d i s t r i b u t i o n   a n d   u s e   i n   s o u r c e   a n d   b i n a r y   f o r m s ,   w i t h   o r   w i t h o u t   m o d i f i c a t i o n ,   a r e   p e r m i t t e d   p r o v i d e d   t h a t   t h e   f o l l o w i n g   c o n d i t i o n s   a r e   m e t :           *   R e d i s t r i b u t i o n s   o f   s o u r c e   c o d e   m u s t   r e t a i n   t h e   a b o v e   c o p y r i g h t   n o t i c e ,   t h i s   l i s t   o f   c o n d i t i o n s   a n d   t h e   f o l l o w i n g   d i s c l a i m e r .          *   R e d i s t r i b u t i o n s   i n   b i n a r y   f o r m   m u s t   r e p r o d u c e   t h e   a b o v e   c o p y r i g h t   n o t i c e ,                t h i s   l i s t   o f   c o n d i t i o n s   a n d   t h e   f o l l o w i n g   d i s c l a i m e r   i n   t h e   d o c u m e n t a t i o n   a n d / o r                o t h e r   m a t e r i a l s   p r o v i d e d   w i t h   t h e   d i s t r i b u t i o n .          *   N e i t h e r   t h e   n a m e   o f   t h e   U n i v e r s i t y   o f   T e c h n o l o g y   D r e s d e n ,   G e r m a n y ,   n o r   t h e   n a m e   o f                t h e   J o n D o s   G m b H ,   n o r   t h e   n a m e s   o f   t h e i r   c o n t r i b u t o r s   m a y   b e   u s e d   t o   e n d o r s e   o r                p r o m o t e   p r o d u c t s   d e r i v e d   f r o m   t h i s   s o f t w a r e   w i t h o u t   s p e c i f i c   p r i o r   w r i t t e n   p e r m i s s i o n .   T H I S   S O F T W A R E   I S   P R O V I D E D   B Y   T H E   C O P Y R I G H T   H O L D E R S   A N D   C O N T R I B U T O R S  " A S   I S "   A N D   A N Y   E X P R E S S   O R   I M P L I E D   W A R R A N T I E S ,   I N C L U D I N G ,   B U T   N O T  L I M I T E D   T O ,   T H E   I M P L I E D   W A R R A N T I E S   O F   M E R C H A N T A B I L I T Y   A N D   F I T N E S S   F O R  A   P A R T I C U L A R   P U R P O S E   A R E   D I S C L A I M E D .   I N   N O   E V E N T   S H A L L   T H E   R E G E N T S   O R  C O N T R I B U T O R S   B E   L I A B L E   F O R   A N Y   D I R E C T ,   I N D I R E C T ,   I N C I D E N T A L ,   S P E C I A L ,  E X E M P L A R Y ,   O R   C O N S E Q U E N T I A L   D A M A G E S   ( I N C L U D I N G ,   B U T   N O T   L I M I T E D   T O ,  P R O C U R E M E N T   O F   S U B S T I T U T E   G O O D S   O R   S E R V I C E S ;   L O S S   O F   U S E ,   D A T A ,   O R  P R O F I T S ;   O R   B U S I N E S S   I N T E R R U P T I O N )   H O W E V E R   C A U S E D   A N D   O N   A N Y   T H E O R Y   O F  L I A B I L I T Y ,   W H E T H E R   I N   C O N T R A C T ,   S T R I C T   L I A B I L I T Y ,   O R   T O R T   ( I N C L U D I N G  N E G L I G E N C E   O R   O T H E R W I S E )   A R I S I N G   I N   A N Y   W A Y   O U T   O F   T H E   U S E   O F   T H I S  S O F T W A R E ,   E V E N   I F   A D V I S E D   O F   T H E   P O S S I B I L I T Y   O F   S U C H   D A M A G E . 
       
     *   J o n D o F o x   p r o f i l e   i n s t a l l a t i o n   s c r i p t   f o r   M a c   O S   X 
     *   2 0 0 7   b y   S i m o n   P e c h e r ,   J o n D o s   G m b H   
       
  
 l     ��������  ��  ��        l          p         ������ 0 firefox_profiles_path  ��    / )firefox profile folder's path (as string)     �   R f i r e f o x   p r o f i l e   f o l d e r ' s   p a t h   ( a s   s t r i n g )      l          p         ������ 0 install_bundle_name  ��    ' !name of the install bundle folder     �   B n a m e   o f   t h e   i n s t a l l   b u n d l e   f o l d e r      l          p         ������ 0 jondoprofile_foldername  ��    H B name of the JondoFox profile folder (within firefox_profile_path)     �     �   n a m e   o f   t h e   J o n d o F o x   p r o f i l e   f o l d e r   ( w i t h i n   f i r e f o x _ p r o f i l e _ p a t h )   ! " ! l      # $ % # p       & & ������ 0 profile_ini_backup_name  ��   $ 1 + name for the file profiles.ini backup file    % � ' ' V   n a m e   f o r   t h e   f i l e   p r o f i l e s . i n i   b a c k u p   f i l e "  ( ) ( l      * + , * p       - - ������ 0 profiles_ini  ��   +  alias for profiles.ini    , � . . , a l i a s   f o r   p r o f i l e s . i n i )  / 0 / l      1 2 3 1 p       4 4 ������ 0 profile_parent_folder  ��   2 E ? name of the profile's parent folder in the installation bundle    3 � 5 5 ~   n a m e   o f   t h e   p r o f i l e ' s   p a r e n t   f o l d e r   i n   t h e   i n s t a l l a t i o n   b u n d l e 0  6 7 6 l      8 9 : 8 p       ; ; ������ 0 profile_version_prefix  ��   9 5 /the JonDoFox profile version prefix in prefs.js    : � < < ^ t h e   J o n D o F o x   p r o f i l e   v e r s i o n   p r e f i x   i n   p r e f s . j s 7  = > = l      ? @ A ? p       B B ������ 0 new_version_str  ��   @ 2 ,the version string of the profile to install    A � C C X t h e   v e r s i o n   s t r i n g   o f   t h e   p r o f i l e   t o   i n s t a l l >  D E D l      F G H F p       I I ������ 0 old_version_str  ��   G T Nthe version string of the already installed JonDoFox profile (if there is one)    H � J J � t h e   v e r s i o n   s t r i n g   o f   t h e   a l r e a d y   i n s t a l l e d   J o n D o F o x   p r o f i l e   ( i f   t h e r e   i s   o n e ) E  K L K l     ��������  ��  ��   L  M N M l      O P Q O p       R R ������ 0 jondofox_bookmarks_ff3  ��   P * $name of the bookmarksfile (FireFox3)    Q � S S H n a m e   o f   t h e   b o o k m a r k s f i l e   ( F i r e F o x 3 ) N  T U T l      V W X V p       Y Y ������ 0 jondofox_bookmarks_ff2  ��   W * $name of the bookmarksfile (FireFox2)    X � Z Z H n a m e   o f   t h e   b o o k m a r k s f i l e   ( F i r e F o x 2 ) U  [ \ [ l      ] ^ _ ] p       ` ` ������ 0 saved_bookmarks  ��   ^ ' !where the old bookmarsk are saved    _ � a a B w h e r e   t h e   o l d   b o o k m a r s k   a r e   s a v e d \  b c b l     ��������  ��  ��   c  d e d i      f g f I     ������
�� .aevtoappnull  �   � ****��  ��   g k    1 h h  i j i r      k l k m     ����   l o      ���� 0 err   j  m n m l   �� o p��   o #  initialize global variables	    p � q q :   i n i t i a l i z e   g l o b a l   v a r i a b l e s 	 n  r s r r     t u t m     v v � w w ( J o n D o F o x _ I n s t a l l . a p p u o      ���� 0 install_bundle_name   s  x y x r     z { z m    	 | | � } }  p r o f i l e { o      ���� 0 jondoprofile_foldername   y  ~  ~ r     � � � m     � � � � �   p r o f i l e s . i n i . b a k � o      ���� 0 profile_ini_backup_name     � � � r     � � � m     � � � � � 6 l o c a l _ i n s t a l l . t i t l e T e m p l a t e � o      ���� 0 profile_version_prefix   �  � � � O   $ � � � r    # � � � b    ! � � � l    ����� � l    ����� � c     � � � n     � � � 1    ��
�� 
ppth � 1    ��
�� 
cusr � m    ��
�� 
TEXT��  ��  ��  ��   � m      � � � � � H L i b r a r y : A p p l i c a t i o n   S u p p o r t : F i r e f o x : � o      ���� 0 firefox_profiles_path   � m     � ��                                                                                  sevs   alis    �  Macintosh HD               á$;H+    �System Events.app                                                q���H
        ����  	                CoreServices    á+      ��9�      �  �  �  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��   �  � � � O  % ? � � � r   ) > � � � b   ) : � � � b   ) 6 � � � l  ) 4 ����� � c   ) 4 � � � l  ) 2 ����� � n   ) 2 � � � m   . 2��
�� 
ctnr � l  ) . ����� � l  ) . ����� � I  ) .�� ���
�� .earsffdralis        afdr �  f   ) *��  ��  ��  ��  ��  ��  ��   � m   2 3��
�� 
TEXT��  ��   � o   4 5���� 0 install_bundle_name   � m   6 9 � � � � � ( : C o n t e n t s : R e s o u r c e s : � l      ����� � o      ���� 0 profile_parent_folder  ��  ��   � m   % & � ��                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��   �  � � � r   @ O � � � b   @ K � � � b   @ G � � � b   @ E � � � o   @ A���� 0 firefox_profiles_path   � m   A D � � � � �  P r o f i l e s : � o   E F���� 0 jondoprofile_foldername   � m   G J � � � � �  : p l a c e s . s q l i t e � o      ���� 0 jondofox_bookmarks_ff3   �  � � � r   P _ � � � b   P [ � � � b   P W � � � b   P U � � � o   P Q���� 0 firefox_profiles_path   � m   Q T � � � � �  P r o f i l e s : � o   U V���� 0 jondoprofile_foldername   � m   W Z � � � � �  : b o o k m a r k s . h t m l � o      ���� 0 jondofox_bookmarks_ff2   �  � � � r   ` g � � � m   ` c � � � � �   � o      ���� 0 saved_bookmarks   �  � � � l  h h��������  ��  ��   �  � � � I   h m�������� 0 get_new_version  ��  ��   �  � � � I  n ��� � �
�� .sysodlogaskr        TEXT � b   n y � � � b   n u � � � m   n q � � � � � V T h i s   w i l l   a d d   t h e   J o n D o F o x   p r o f i l e   v e r s i o n   � o   q t���� 0 new_version_str   � m   u x � � � � � 4   t o   y o u r   F i r e f o x   p r o f i l e s . � �� ���
�� 
btns � J   | � � �  � � � m   |  � � � � �  O K �  ��� � m    � � � � � �  C a n c e l��  ��   �  � � � Z   � � � ����� � l  � � ����� � =   � � � � � n   � � � � � 1   � ���
�� 
bhit � 1   � ���
�� 
rslt � m   � � � � � � �  C a n c e l��  ��   � L   � � � � m   � �����  ��  ��   �  � � � l  � ���������  ��  ��   �  � � � l  � ��� � ���   � T N We assume that if there are no saved settings of Firefox, it isn't installed.    � � � � �   W e   a s s u m e   t h a t   i f   t h e r e   a r e   n o   s a v e d   s e t t i n g s   o f   F i r e f o x ,   i t   i s n ' t   i n s t a l l e d . �    Q   � � r   � � c   � � l  � �	����	 l  � �
����
 b   � � o   � ����� 0 firefox_profiles_path   m   � � �  p r o f i l e s . i n i��  ��  ��  ��   m   � ���
�� 
alis o      ���� 0 profiles_ini   R      ������
�� .ascrerr ****      � ****��  ��   k   � �  I  � ���
�� .sysodlogaskr        TEXT m   � � � X S o r r y ,   b u t   y o u   d o n ' t   h a v e   F i r e f o x   i n s t a l l e d . ����
�� 
btns J   � � �� m   � � �  O K��  ��   �� r   � � m   � �����  o      ���� 0 err  ��    l  � ���������  ��  ��    !  l  � ���"#��  " 5 / main handler: first edit the profiles.ini ...    # �$$ ^   m a i n   h a n d l e r :   f i r s t   e d i t   t h e   p r o f i l e s . i n i   . . .  ! %&% Z   � �'(����' l  � �)����) =   � �*+* o   � ����� 0 err  + m   � �����  ��  ��  ( k   � �,, -.- l  � ���/0��  / R L if Firefox is running during the installation it may fail, so quit Firefox.   0 �11 �   i f   F i r e f o x   i s   r u n n i n g   d u r i n g   t h e   i n s t a l l a t i o n   i t   m a y   f a i l ,   s o   q u i t   F i r e f o x .. 232 O  � �454 I  � ������
�� .aevtquitnull��� ��� null��  �  5 m   � �66�                                                                                  MOZB   alis    P  Macintosh HD               á$;H+    ZFirefox.app                                                     1b��t;U        ����  	                Applications    á+      �t5      Z  %Macintosh HD:Applications:Firefox.app     F i r e f o x . a p p    M a c i n t o s h   H D  Applications/Firefox.app  / ��  3 7�~7 r   � �898 I   � ��}�|�{�} 0 edit_profiles_ini  �|  �{  9 o      �z�z 0 err  �~  ��  ��  & :;: l  � ��y<=�y  < I C ... if successful: copy the folder containing the JonDoFox profile   = �>> �   . . .   i f   s u c c e s s f u l :   c o p y   t h e   f o l d e r   c o n t a i n i n g   t h e   J o n D o F o x   p r o f i l e; ?@? Z   � �AB�x�wA l  � �C�v�uC =   � �DED o   � ��t�t 0 err  E m   � ��s�s  �v  �u  B r   � �FGF I   � ��r�q�p�r 0 copy_folder  �q  �p  G o      �o�o 0 err  �x  �w  @ HIH l  � ��nJK�n  J ( " installation procedure successful   K �LL D   i n s t a l l a t i o n   p r o c e d u r e   s u c c e s s f u lI MNM Z   �OP�m�lO l  � �Q�k�jQ =   � �RSR o   � ��i�i 0 err  S m   � ��h�h  �k  �j  P I �gTU
�g .sysodlogaskr        TEXTT m  VV �WW N J o n D o F o x   p r o f i l e   s u c c e s s f u l l y   i n s t a l l e dU �fX�e
�f 
btnsX J  YY Z�dZ m  
[[ �\\  O K�d  �e  �m  �l  N ]^] l �c_`�c  _ $  installation procedure failed   ` �aa <   i n s t a l l a t i o n   p r o c e d u r e   f a i l e d^ bcb Z  .de�b�ad l f�`�_f =  ghg o  �^�^ 0 err  h m  �]�] �`  �_  e I *�\ij
�\ .sysodlogaskr        TEXTi m  kk �ll r A n   E r r o r   o c c u r e d :   J o n D o F o x   p r o f i l e   c o u l d   n o t   b e   i n s t a l l e dj �[m�Z
�[ 
btnsm J  !&nn o�Yo m  !$pp �qq  O K�Y  �Z  �b  �a  c r�Xr L  /1ss o  /0�W�W 0 err  �X   e tut l     �V�U�T�V  �U  �T  u vwv l     �Sxy�S  x / ) appends JonDoFox profile to profiles.ini   y �zz R   a p p e n d s   J o n D o F o x   p r o f i l e   t o   p r o f i l e s . i n iw {|{ i    }~} I      �R�Q�P�R 0 edit_profiles_ini  �Q  �P  ~ k    � ��� l     �O���O  � # new entries for profiles.ini    � ��� : n e w   e n t r i e s   f o r   p r o f i l e s . i n i  � ��� r     ��� b     ��� b     ��� m     �� ���  [ G e n e r a l ]� o    �N
�N 
ret � m    �� ��� , S t a r t W i t h L a s t P r o f i l e = 0� o      �M�M 0 profiles_ini_header  � ��� r    ��� b    ��� b    ��� b    ��� b    ��� b    ��� b    ��� o    	�L
�L 
ret � m   	 
�� ���  N a m e = J o n D o F o x� o    �K
�K 
ret � m    �� ���  I s R e l a t i v e = 1� o    �J
�J 
ret � m    �� ���  P a t h = P r o f i l e s /� o    �I�I 0 jondoprofile_foldername  � o      �H�H 0 jondofox_profile_entry  � ��� l   �G�F�E�G  �F  �E  � ��� l   �D�C�B�D  �C  �B  � ��� l   �A���A  � u oread all the entries from the profile.ini to buf. (This will do because the file shouldn't be incredibly large)   � ��� � r e a d   a l l   t h e   e n t r i e s   f r o m   t h e   p r o f i l e . i n i   t o   b u f .   ( T h i s   w i l l   d o   b e c a u s e   t h e   f i l e   s h o u l d n ' t   b e   i n c r e d i b l y   l a r g e )� ��� r    $��� I   "�@��?
�@ .rdwropenshor       file� 4    �>�
�> 
file� l   ��=�<� c    ��� o    �;�; 0 profiles_ini  � m    �:
�: 
TEXT�=  �<  �?  � o      �9�9 0 profile_ini_fdr  � ��� Q   % [���� k   ( ;�� ��� r   ( 5��� I  ( 3�8��
�8 .rdwrread****        ****� o   ( )�7�7 0 profile_ini_fdr  � �6��5
�6 
rdto� l  * /��4�3� I  * /�2��1
�2 .rdwrgeofcomp       ****� o   * +�0�0 0 profile_ini_fdr  �1  �4  �3  �5  � o      �/�/ 0 buf  � ��.� I  6 ;�-��,
�- .rdwrclosnull���     ****� o   6 7�+�+ 0 profile_ini_fdr  �,  �.  � R      �*�)�(
�* .ascrerr ****      � ****�)  �(  � k   C [�� ��� I  C H�'��&
�' .rdwrclosnull���     ****� o   C D�%�% 0 profile_ini_fdr  �&  � ��� I  I X�$��
�$ .sysodlogaskr        TEXT� m   I L�� ��� P E r r o r :   c o u l d n ' t   r e a d   F i r e f o x   p r o f i l e . i n i� �#��"
�# 
btns� J   O T�� ��!� m   O R�� ���  O K�!  �"  � �� � L   Y [�� m   Y Z�� �   � ��� l  \ \����  �  �  � ��� l  \ \����  � ; 5 Detection of an already installed JonDoFox profile.    � ��� j   D e t e c t i o n   o f   a n   a l r e a d y   i n s t a l l e d   J o n D o F o x   p r o f i l e .  � ��� l  \ \����  � Q K (Then replace it without messing up the profiles.ini with useless entries)   � ��� �   ( T h e n   r e p l a c e   i t   w i t h o u t   m e s s i n g   u p   t h e   p r o f i l e s . i n i   w i t h   u s e l e s s   e n t r i e s )� ��� l  \[���� Z   \[����� l  \ a���� E  \ a��� o   \ ]�� 0 buf  � m   ] `�� ���  N a m e = J o n D o F o x�  �  � k   dW�� ��� I   d i���� 0 get_old_version  �  �  � ��� Z   j z����� l  j q���� =  j q��� o   j m�� 0 old_version_str  � m   m p�� ���  ? ? ?�  �  � L   t v�� m   t u�� �  �  �  �  l  {W Z   {W�
 l  { ��	� =  { �	 o   { ~�� 0 old_version_str  	 o   ~ ��� 0 new_version_str  �	  �   k   � �

  I  � ��
� .sysodlogaskr        TEXT b   � � b   � � b   � � b   � � b   � � m   � � � � Y o u   h a v e   a l r e a d y   i n s t a l l e d   a   J o n D o F o x   p r o f i l e   o f   t h e   s a m e   v e r s i o n   ( o   � ��� 0 old_version_str   m   � � �  ) . o   � ��
� 
ret  o   � ��
� 
ret  m   � � � � I f   y o u   c o n t i n u e   i t   w i l l   b e   r e p l a c e d .     Y o u r   B o o k m a r k s   w i l l   b e   k e p t . �� 
� 
btns J   � �   !"! m   � �## �$$  C o n t i n u e" %��% m   � �&& �'' 
 A b o r t��  �    (��( Z   � �)*��+) l  � �,����, =   � �-.- n   � �/0/ 1   � ���
�� 
bhit0 1   � ���
�� 
rslt. m   � �11 �22  C o n t i n u e��  ��  * k   � �33 454 I   � ��������� 0 copy_bookmarks  ��  ��  5 6��6 L   � �77 m   � �����  ��  ��  + L   � �88 m   � ����� ��  �
   l  �W9:;9 Z   �W<=��>< l  � �?����? ?  � �@A@ o   � ����� 0 old_version_str  A o   � ����� 0 new_version_str  ��  ��  = k   �BB CDC I  � ���EF
�� .sysodlogaskr        TEXTE b   � �GHG b   � �IJI b   � �KLK b   � �MNM b   � �OPO b   � �QRQ m   � �SS �TT � W a r n i n g :   Y o u   h a v e   a l r e a d y   i n s t a l l e d   a   J o n D o F o x   p r o f i l e   o f   a   n e w e r   v e r s i o n   (R o   � ����� 0 old_version_str  P m   � �UU �VV  ) .N o   � ���
�� 
ret L o   � ���
�� 
ret J m   � �WW �XX � I f   y o u   	 c o n t i n u e   i t   w i l l   b e   r e p l a c e d   w i t h   t h e   o l d e r   v e r s i o n .   Y o u r   B o o k m a r k s   w i l l   b e   k e p t .H o   � ����� 0 new_version_str  F ��Y��
�� 
btnsY J   � �ZZ [\[ m   � �]] �^^  C o n t i n u e\ _��_ m   � �`` �aa 
 A b o r t��  ��  D b��b Z   �cd��ec l  �f����f =   �ghg n   � �iji 1   � ���
�� 
bhitj 1   � ���
�� 
rslth m   �kk �ll  C o n t i n u e��  ��  d k  mm non I  
�������� 0 copy_bookmarks  ��  ��  o p��p L  qq m  ����  ��  ��  e L  rr m  ���� ��  ��  > k  Wss tut I ;��vw
�� .sysodlogaskr        TEXTv b  ,xyx b  (z{z b  $|}| b  "~~ b   ��� b  ��� m  �� ��� � Y o u   h a v e   a l r e a d y   i n s t a l l e d   a n   o l d e r   v e r s i o n   o f   t h e   J o n D o F o x   p r o f i l e   (� o  ���� 0 old_version_str  � m  �� ���  ) . o   !��
�� 
ret } o  "#��
�� 
ret { m  $'�� ��� � C l i c k   c o n t i n u e   t o   u p g r a d e   i t   t o   v e r s i o n .   Y o u r   B o o k m a r k s   w i l l   b e   k e p t .y o  (+���� 0 new_version_str  w �����
�� 
btns� J  /7�� ��� m  /2�� ���  C o n t i n u e� ���� m  25�� ��� 
 A b o r t��  ��  u ���� Z  <W������ l <G������ =  <G��� n  <C��� 1  ?C��
�� 
bhit� 1  <?��
�� 
rslt� m  CF�� ���  C o n t i n u e��  ��  � k  JR�� ��� I  JO�������� 0 copy_bookmarks  ��  ��  � ���� L  PR�� m  PQ����  ��  ��  � L  UW�� m  UV���� ��  : "  installed version is newer    ; ��� 8   i n s t a l l e d   v e r s i o n   i s   n e w e r     versions equal    ���    v e r s i o n s   e q u a l�  �  �  � ) # JonDoFox profile already installed   � ��� F   J o n D o F o x   p r o f i l e   a l r e a d y   i n s t a l l e d� ��� l \\������  � ) # saving old version of profiles.ini   � ��� F   s a v i n g   o l d   v e r s i o n   o f   p r o f i l e s . i n i� ��� I  \a�������� 0 backup_profile_ini  ��  ��  � ��� l bb��������  ��  ��  � ��� l bb������  �   modify profiles.ini   � ��� (   m o d i f y   p r o f i l e s . i n i� ��� r  bp��� b  bn��� b  bl��� b  be��� o  bc��
�� 
ret � o  cd��
�� 
ret � I  ek������� 0 get_next_profile  � ���� o  fg���� 0 buf  ��  ��  � o  lm���� 0 jondofox_profile_entry  � o      ���� 0 complete_entry  � ��� Q  q����� k  t��� ��� r  t���� I t�����
�� .rdwropenshor       file� 4  t|���
�� 
alis� l x{������ c  x{��� o  xy���� 0 profiles_ini  � m  yz��
�� 
TEXT��  ��  � �����
�� 
perm� m  ���
�� boovtrue��  � o      ���� 0 profile_ini_fdw  � ��� l ��������  � l frewriting the general header of profiles.ini will force Firefox to open the profile manager at startup   � ��� � r e w r i t i n g   t h e   g e n e r a l   h e a d e r   o f   p r o f i l e s . i n i   w i l l   f o r c e   F i r e f o x   t o   o p e n   t h e   p r o f i l e   m a n a g e r   a t   s t a r t u p� ��� I ������
�� .rdwrwritnull���     ****� o  ������ 0 profiles_ini_header  � ����
�� 
wrat� m  ������ � �����
�� 
refn� o  ������ 0 profile_ini_fdw  ��  � ��� l ��������  � ( " append the JonDoFox profile entry   � ��� D   a p p e n d   t h e   J o n D o F o x   p r o f i l e   e n t r y� ��� I ������
�� .rdwrwritnull���     ****� o  ������ 0 complete_entry  � ����
�� 
wrat� l �������� [  ����� l �������� I �������
�� .rdwrgeofcomp       ****� o  ������ 0 profile_ini_fdw  ��  ��  ��  � m  ������ ��  ��  � �����
�� 
refn� o  ������ 0 profile_ini_fdw  ��  � ���� I �������
�� .rdwrclosnull���     ****� o  ������ 0 profile_ini_fdw  ��  ��  � R      ������
�� .ascrerr ****      � ****��  ��  � k  ���� ��� I �������
�� .rdwrclosnull���     ****� o  ������ 0 profile_ini_fdw  ��  � ��� I ������
�� .sysodlogaskr        TEXT� m  ���� ��� P E r r o r :   c o u l d n ' t   e d i t   F i r e f o x   p r o f i l e . i n i� �����
�� 
btns� J  ���� ���� m  ���� ���  O K��  ��  �    l ����������  ��  ��   �� L  �� m  ������ ��  � �� L  �� m  ������  ��  |  l     ��~�}�  �~  �}   	 l     �|
�|  
 J D copies the JonDoFox profile folder to the Firefox profile directory    � �   c o p i e s   t h e   J o n D o F o x   p r o f i l e   f o l d e r   t o   t h e   F i r e f o x   p r o f i l e   d i r e c t o r y	  i     I      �{�z�y�{ 0 copy_folder  �z  �y   k     \  Q     Y O    9 k    8  I   �x
�x .coreclon****      � **** l   �w�v c      l   
!�u�t! b    
"#" o    �s�s 0 profile_parent_folder  # o    	�r�r 0 jondoprofile_foldername  �u  �t    m   
 �q
�q 
alis�w  �v   �p$%
�p 
insh$ l   &�o�n& c    '(' b    )*) o    �m�m 0 firefox_profiles_path  * m    ++ �,,  P r o f i l e s :( m    �l
�l 
alis�o  �n  % �k-�j
�k 
alrp- m    �i
�i boovtrue�j   .�h. Z    8/0�g�f/ l   !1�e�d1 I   !�c2�b
�c .coredoexbool        obj 2 l   3�a�`3 4    �_4
�_ 
file4 o    �^�^ 0 saved_bookmarks  �a  �`  �b  �e  �d  0 I  $ 4�]56
�] .coremoveobj        obj 5 l  $ (7�\�[7 4   $ (�Z8
�Z 
file8 o   & '�Y�Y 0 saved_bookmarks  �\  �[  6 �X9:
�X 
insh9 l  ) .;�W�V; c   ) .<=< b   ) ,>?> o   ) *�U�U 0 firefox_profiles_path  ? m   * +@@ �AA   P r o f i l e s : p r o f i l e= m   , -�T
�T 
alis�W  �V  : �SB�R
�S 
alrpB m   / 0�Q
�Q boovtrue�R  �g  �f  �h   m    CC�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��   R      �P�O�N
�P .ascrerr ****      � ****�O  �N   k   A YDD EFE l  A A�MGH�M  G D >if something goes wrong: restore old settings from backup file   H �II | i f   s o m e t h i n g   g o e s   w r o n g :   r e s t o r e   o l d   s e t t i n g s   f r o m   b a c k u p   f i l eF JKJ I   A F�L�K�J�L 0 restore_old_settings  �K  �J  K LML I  G V�INO
�I .sysodlogaskr        TEXTN m   G JPP �QQ V E r r o r :   c o u l d n ' t   f i n d   F i r e f o x   p r o f i l e   f o l d e rO �HR�G
�H 
btnsR J   M RSS T�FT m   M PUU �VV  O K�F  �G  M W�EW L   W YXX m   W X�D�D �E   Y�CY L   Z \ZZ m   Z [�B�B  �C   [\[ l     �A�@�?�A  �@  �?  \ ]^] l     �>_`�>  _ 1 + find out the number of installed profiles    ` �aa V   f i n d   o u t   t h e   n u m b e r   o f   i n s t a l l e d   p r o f i l e s  ^ bcb i    ded I      �=f�<�= 0 get_next_profile  f g�;g o      �:�: 0 	prof_file  �;  �<  e k     -hh iji r     klk m     �9
�9 boovtruel o      �8�8 0 not_reached  j mnm r    opo m    �7�7��p o      �6�6 0 ctr  n qrq r    sts m    	uu �vv  t o      �5�5 0 profile_header  r wxw V    *yzy k    %{{ |}| r    ~~ l   ��4�3� [    ��� o    �2�2 0 ctr  � m    �1�1 �4  �3   o      �0�0 0 ctr  } ��� r    ��� b    ��� b    ��� m    �� ���  [ P r o f i l e� o    �/�/ 0 ctr  � m    �� ���  ]� o      �.�. 0 profile_header  � ��-� r     %��� l    #��,�+� E    #��� o     !�*�* 0 	prof_file  � o   ! "�)�) 0 profile_header  �,  �+  � o      �(�( 0 not_reached  �-  z o    �'�' 0 not_reached  x ��&� L   + -�� o   + ,�%�% 0 profile_header  �&  c ��� l     �$�#�"�$  �#  �"  � ��� l     �!���!  � + %saves the existing jondofox bookmarks   � ��� J s a v e s   t h e   e x i s t i n g   j o n d o f o x   b o o k m a r k s� ��� i    ��� I      � ���  0 copy_bookmarks  �  �  � O     9��� k    8�� ��� Z    (����� l   ���� I   ���
� .coredoexbool        obj � l   ���� 4    ��
� 
file� o    �� 0 jondofox_bookmarks_ff3  �  �  �  �  �  � k    �� ��� r    ��� c    ��� o    �� 0 jondofox_bookmarks_ff3  � m    �
� 
alis� o      �� 0 jondofox_bookmarks_file  � ��� r    ��� b    ��� o    �� 0 firefox_profiles_path  � m    �� ���  p l a c e s . s q l i t e� o      �� 0 saved_bookmarks  �  �  � k    (�� ��� r    "��� c     ��� o    �� 0 jondofox_bookmarks_ff2  � m    �
� 
alis� o      �� 0 jondofox_bookmarks_file  � ��� r   # (��� b   # &��� o   # $�
�
 0 firefox_profiles_path  � m   $ %�� ���  b o o k m a r k s . h t m l� o      �	�	 0 saved_bookmarks  �  � ��� r   ) .��� c   ) ,��� o   ) *�� 0 firefox_profiles_path  � m   * +�
� 
alis� o      �� 0 temp_folder  � ��� I  / 8���
� .coremoveobj        obj � l  / 0���� o   / 0�� 0 jondofox_bookmarks_file  �  �  � � ��
�  
insh� l  1 2������ o   1 2���� 0 temp_folder  ��  ��  � �����
�� 
alrp� m   3 4��
�� boovtrue��  �  � m     ���                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  � ��� l     ��������  ��  ��  � ��� l     ������  � %  create a backup of profile.ini   � ��� >   c r e a t e   a   b a c k u p   o f   p r o f i l e . i n i� ��� i    ��� I      �������� 0 backup_profile_ini  ��  ��  � Q     U���� O    >��� k    =�� ��� Z    )������� l   ������ I   �����
�� .coredoexbool        obj � l   ������ 4    ���
�� 
file� l  	 ������ b   	 ��� o   	 
���� 0 firefox_profiles_path  � o   
 ���� 0 profile_ini_backup_name  ��  ��  ��  ��  ��  ��  ��  � k    %�� ��� I   �����
�� .coredeloobj        obj � c    ��� l   ������ b    ��� o    ���� 0 firefox_profiles_path  � o    ���� 0 profile_ini_backup_name  ��  ��  � m    ��
�� 
alis��  � ���� I   %�����
�� .fndremptnull��� ��� obj � 1    !��
�� 
trsh��  ��  ��  ��  �    r   * 5 l  * 3���� I  * 3��
�� .coreclon****      � **** o   * +���� 0 profiles_ini   ����
�� 
insh l  , /���� c   , /	
	 o   , -���� 0 firefox_profiles_path  
 m   - .��
�� 
alis��  ��  ��  ��  ��   o      ���� 0 backup_file   �� r   6 = c   6 9 o   6 7���� 0 profile_ini_backup_name   m   7 8��
�� 
utxt n       1   : <��
�� 
pnam o   9 :���� 0 backup_file  ��  � m    �                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  � R      ������
�� .ascrerr ****      � ****��  ��  � I  F U��
�� .sysodlogaskr        TEXT m   F I � � E r r o r   o c c u r e d   w h i l e   s a v i n g   p r o f i l e s . i n i .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i s ����
�� 
btns J   L Q �� m   L O �  O K��  ��  �  l     ��������  ��  ��    l     �� !��    Z T restore old settings in case the copy process of the JonDoFox profile folder fails    ! �"" �   r e s t o r e   o l d   s e t t i n g s   i n   c a s e   t h e   c o p y   p r o c e s s   o f   t h e   J o n D o F o x   p r o f i l e   f o l d e r   f a i l s   #$# i    %&% I      �������� 0 restore_old_settings  ��  ��  & Q     J'()' O    7*+* Z    6,-����, l   .����. I   ��/��
�� .coredoexbool        obj / l   0����0 4    ��1
�� 
file1 l  	 2����2 b   	 343 o   	 
���� 0 firefox_profiles_path  4 o   
 ���� 0 profile_ini_backup_name  ��  ��  ��  ��  ��  ��  ��  - k    255 676 I   ��8��
�� .coredeloobj        obj 8 o    ���� 0 profiles_ini  ��  7 9:9 I   !��;��
�� .fndremptnull��� ��� obj ; 1    ��
�� 
trsh��  : <=< r   " *>?> l  " (@����@ 4   " (��A
�� 
fileA l  $ 'B����B b   $ 'CDC o   $ %���� 0 firefox_profiles_path  D o   % &���� 0 profile_ini_backup_name  ��  ��  ��  ��  ? o      ���� 0 backup_file  = E��E r   + 2FGF c   + .HIH m   + ,JJ �KK  p r o f i l e s . i n iI m   , -��
�� 
utxtG n      LML 1   / 1��
�� 
pnamM o   . /���� 0 backup_file  ��  ��  ��  + m    NN�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  ( R      ������
�� .ascrerr ****      � ****��  ��  ) I  ? J��OP
�� .sysodlogaskr        TEXTO m   ? @QQ �RR � E r r o r   o c c u r e d   w h i l e   r e s t o r i n g   o l d   s e t t i n g s .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i sP ��S��
�� 
btnsS J   A FTT U��U m   A DVV �WW  O K��  ��  $ XYX l     ��������  ��  ��  Y Z[Z l     ��\]��  \ 8 2 sets the version string of the profile to install   ] �^^ d   s e t s   t h e   v e r s i o n   s t r i n g   o f   t h e   p r o f i l e   t o   i n s t a l l[ _`_ i    aba I      �������� 0 get_new_version  ��  ��  b r     cdc I     
��e���� 0 get_version  e f��f b    ghg b    iji o    ���� 0 profile_parent_folder  j o    ���� 0 jondoprofile_foldername  h m    kk �ll  : p r e f s . j s��  ��  d o      ���� 0 new_version_str  ` mnm l     ��������  ��  ��  n opo l     ��qr��  q Z T sets the version string of the already installed JonDoFox profile (if there is one)   r �ss �   s e t s   t h e   v e r s i o n   s t r i n g   o f   t h e   a l r e a d y   i n s t a l l e d   J o n D o F o x   p r o f i l e   ( i f   t h e r e   i s   o n e )p tut i     #vwv I      �������� 0 get_old_version  ��  ��  w r     xyx I     ��z���� 0 get_version  z {��{ b    |}| b    ~~ b    ��� o    �� 0 firefox_profiles_path  � m    �� ���  P r o f i l e s : o    �~�~ 0 jondoprofile_foldername  } m    �� ���  : p r e f s . j s��  ��  y o      �}�} 0 old_version_str  u ��� l     �|�{�z�|  �{  �z  � ��� l     �y���y  � A ; parses the version string from the specified prefs.js file   � ��� v   p a r s e s   t h e   v e r s i o n   s t r i n g   f r o m   t h e   s p e c i f i e d   p r e f s . j s   f i l e� ��x� i   $ '��� I      �w��v�w 0 get_version  � ��u� o      �t�t 0 prefs_js_file  �u  �v  � k     ��� ��� l     �s�r�q�s  �r  �q  � ��� r     ��� m     �p�p 3� o      �o�o 0 	magic_off  � ��� r    ��� m    �n�n � o      �m�m 0 version_string_end  � ��l� O    ���� Z    ����k�� l   ��j�i� I   �h��g
�h .coredoexbool        obj � l   ��f�e� 4    �d�
�d 
file� o    �c�c 0 prefs_js_file  �f  �e  �g  �j  �i  � k    ��� ��� l   �b�a�`�b  �a  �`  � ��� r    !��� I   �_��^
�_ .rdwropenshor       file� 4    �]�
�] 
file� l   ��\�[� o    �Z�Z 0 prefs_js_file  �\  �[  �^  � o      �Y�Y 0 prefs_js_fdr  � ��� Q   " L���� k   % <�� ��� l  % %�X�W�V�X  �W  �V  � ��� r   % ,��� I  % *�U��T
�U .rdwrgeofcomp       ****� o   % &�S�S 0 prefs_js_fdr  �T  � o      �R�R 0 prefs_js_end  � ��� r   - 6��� l  - 4��Q�P� I  - 4�O��
�O .rdwrread****        ****� o   - .�N�N 0 prefs_js_fdr  � �M��L
�M 
rdto� o   / 0�K�K 0 prefs_js_end  �L  �Q  �P  � o      �J�J 0 buf  � ��� l  7 7�I�H�G�I  �H  �G  � ��F� I  7 <�E��D
�E .rdwrclosnull���     ****� o   7 8�C�C 0 prefs_js_fdr  �D  �F  � R      �B�A�@
�B .ascrerr ****      � ****�A  �@  � k   D L�� ��� I  D I�?��>
�? .rdwrclosnull���     ****� o   D E�=�= 0 prefs_js_fdr  �>  � ��<� L   J L�� m   J K�� ���  ? ? ?�<  � ��� l  M M�;�:�9�;  �:  �9  � ��� r   M X��� l  M V��8�7� l  M V��6�5� I  M V�4�3�
�4 .sysooffslong    ��� null�3  � �2��
�2 
psof� l  O P��1�0� o   O P�/�/ 0 profile_version_prefix  �1  �0  � �.��-
�. 
psin� o   Q R�,�, 0 buf  �-  �6  �5  �8  �7  � o      �+�+ 0 version_offset  � ��� Z   Y }���*�� l  Y \��)�(� >  Y \��� l  Y Z��'�&� o   Y Z�%�% 0 version_offset  �'  �&  � m   Z [�$�$  �)  �(  � k   _ v�� ��� r   _ t��� n   _ r��� 7  ` r�#��
�# 
ctxt� l  f j��"�!� [   f j��� o   g h� �  0 version_offset  � o   h i�� 0 	magic_off  �"  �!  � l  k q���� [   k q��� [   l o��� o   l m�� 0 version_offset  � o   m n�� 0 	magic_off  � o   o p�� 0 version_string_end  �  �  � o   _ `�� 0 buf  � o      �� 0 version_str  � ��� l  u u����  � ; 5display dialog (version_str as string) buttons {"OK"}   � ��� j d i s p l a y   d i a l o g   ( v e r s i o n _ s t r   a s   s t r i n g )   b u t t o n s   { " O K " }�  �*  � k   y }�� ��� l  y y� �      ignore or error ?    � $   i g n o r e   o r   e r r o r   ?� � L   y } m   y | �  ? ? ?�  � � L   ~ � o   ~ �� 0 version_str  �  �k  � L   � �		 m   � �

 �  ? ? ?� m    	�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  �l  �x       ��   
�������
�	��
� .aevtoappnull  �   � ****� 0 edit_profiles_ini  � 0 copy_folder  � 0 get_next_profile  � 0 copy_bookmarks  � 0 backup_profile_ini  �
 0 restore_old_settings  �	 0 get_new_version  � 0 get_old_version  � 0 get_version   � g���
� .aevtoappnull  �   � ****�  �     6� v� |�  ��� ��� ������� ��� ����� ��� � ��� � ��� ����� ��� ��� � ������� ���������6������V[kp� 0 err  � 0 install_bundle_name  �  0 jondoprofile_foldername  �� 0 profile_ini_backup_name  �� 0 profile_version_prefix  
�� 
cusr
�� 
ppth
�� 
TEXT�� 0 firefox_profiles_path  
�� .earsffdralis        afdr
�� 
ctnr�� 0 profile_parent_folder  �� 0 jondofox_bookmarks_ff3  �� 0 jondofox_bookmarks_ff2  �� 0 saved_bookmarks  �� 0 get_new_version  �� 0 new_version_str  
�� 
btns
�� .sysodlogaskr        TEXT
�� 
rslt
�� 
bhit
�� 
alis�� 0 profiles_ini  ��  ��  
�� .aevtquitnull��� ��� null�� 0 edit_profiles_ini  �� 0 copy_folder  �2jE�O�E�O�E�O�E�O�E�O� *�,�,�&�%E�UO� )j a ,�&�%a %E` UO�a %�%a %E` O�a %�%a %E` Oa E` O*j+ Oa _ %a %a  a !a "lvl #O_ $a %,a &  jY hO �a '%a (&E` )W X * +a ,a  a -kvl #OkE�O�j  a . *j /UO*j+ 0E�Y hO�j  *j+ 1E�Y hO�j  a 2a  a 3kvl #Y hO�k  a 4a  a 5kvl #Y hO� ��~�������� 0 edit_profiles_ini  ��  ��   �������������� 0 profiles_ini_header  �� 0 jondofox_profile_entry  �� 0 profile_ini_fdr  �� 0 buf  �� 0 complete_entry  �� 0 profile_ini_fdw   9�������������������������������������������#&����1��SUW]`k������������������������
�� 
ret �� 0 jondoprofile_foldername  
�� 
file�� 0 profiles_ini  
�� 
TEXT
�� .rdwropenshor       file
�� 
rdto
�� .rdwrgeofcomp       ****
�� .rdwrread****        ****
�� .rdwrclosnull���     ****��  ��  
�� 
btns
�� .sysodlogaskr        TEXT�� 0 get_old_version  �� 0 old_version_str  �� 0 new_version_str  
�� 
rslt
�� 
bhit�� 0 copy_bookmarks  �� 0 backup_profile_ini  �� 0 get_next_profile  
�� 
alis
�� 
perm
�� 
wrat
�� 
refn�� 
�� .rdwrwritnull���     ****�����%�%E�O��%�%�%�%�%�%E�O*���&/j 
E�O ��j l E�O�j W X  �j Oa a a kvl OkO�a  �*j+ O_ a   kY hO_ _   Ca _ %a %�%�%a %a a a lvl O_ a  ,a !  *j+ "OjY lY �_ _  Ga #_ %a $%�%�%a %%_ %a a &a 'lvl O_ a  ,a (  *j+ "OjY lY Da )_ %a *%�%�%a +%_ %a a ,a -lvl O_ a  ,a .  *j+ "OjY lY hO*j+ /O��%*�k+ 0%�%E�O C*a 1��&/a 2el 
E�O�a 3ka 4�a 5 6O�a 3�j ka 4�a 5 6O�j W X  �j Oa 7a a 8kvl OkOj ���������� 0 copy_folder  ��  ��     C����������+������������@��������P��U���� 0 profile_parent_folder  �� 0 jondoprofile_foldername  
�� 
alis
�� 
insh�� 0 firefox_profiles_path  
�� 
alrp�� 
�� .coreclon****      � ****
�� 
file�� 0 saved_bookmarks  
�� .coredoexbool        obj 
�� .coremoveobj        obj ��  ��  �� 0 restore_old_settings  
�� 
btns
�� .sysodlogaskr        TEXT�� ] ;� 3��%�&���%�&�e� 	O*��/j  *��/���%�&�e� Y hUW X  *j+ Oa a a kvl OkOj ��e�������� 0 get_next_profile  �� �� ��    ���� 0 	prof_file  ��   ���������� 0 	prof_file  �� 0 not_reached  �� 0 ctr  �� 0 profile_header   u���� .eE�OiE�O�E�O h��kE�O�%�%E�O��E�[OY��O� �������!"���� 0 copy_bookmarks  ��  ��  ! ������ 0 jondofox_bookmarks_file  �� 0 temp_folder  " �������������������������
�� 
file�� 0 jondofox_bookmarks_ff3  
�� .coredoexbool        obj 
�� 
alis�� 0 firefox_profiles_path  �� 0 saved_bookmarks  �� 0 jondofox_bookmarks_ff2  
�� 
insh
�� 
alrp�� 
�� .coremoveobj        obj �� :� 6*��/j  ��&E�O��%E�Y ��&E�O��%E�O��&E�O���e� U �������#$���� 0 backup_profile_ini  ��  ��  # ���� 0 backup_file  $ ��������������������������~�}�|�{
�� 
file�� 0 firefox_profiles_path  �� 0 profile_ini_backup_name  
�� .coredoexbool        obj 
�� 
alis
�� .coredeloobj        obj 
�� 
trsh
�� .fndremptnull��� ��� obj �� 0 profiles_ini  
�� 
insh
�� .coreclon****      � ****
�� 
utxt
� 
pnam�~  �}  
�| 
btns
�{ .sysodlogaskr        TEXT�� V @� 8*���%/j  ��%�&j O*�,j Y hO����&l E�O��&��,FUW X  a a a kvl  �z&�y�x%&�w�z 0 restore_old_settings  �y  �x  % �v�v 0 backup_file  & N�u�t�s�r�q�p�o�nJ�m�l�k�jQ�iV�h
�u 
file�t 0 firefox_profiles_path  �s 0 profile_ini_backup_name  
�r .coredoexbool        obj �q 0 profiles_ini  
�p .coredeloobj        obj 
�o 
trsh
�n .fndremptnull��� ��� obj 
�m 
utxt
�l 
pnam�k  �j  
�i 
btns
�h .sysodlogaskr        TEXT�w K 9� 1*���%/j  #�j O*�,j O*���%/E�O��&��,FY hUW X  ��a kvl  �gb�f�e'(�d�g 0 get_new_version  �f  �e  '  ( �c�bk�a�`�c 0 profile_parent_folder  �b 0 jondoprofile_foldername  �a 0 get_version  �` 0 new_version_str  �d *��%�%k+ E� �_w�^�])*�\�_ 0 get_old_version  �^  �]  )  * �[��Z��Y�X�[ 0 firefox_profiles_path  �Z 0 jondoprofile_foldername  �Y 0 get_version  �X 0 old_version_str  �\ *��%�%�%k+ E� �W��V�U+,�T�W 0 get_version  �V �S-�S -  �R�R 0 prefs_js_file  �U  + �Q�P�O�N�M�L�K�J�Q 0 prefs_js_file  �P 0 	magic_off  �O 0 version_string_end  �N 0 prefs_js_fdr  �M 0 prefs_js_end  �L 0 buf  �K 0 version_offset  �J 0 version_str  , �I�H�G�F�E�D�C�B�A�@��?�>�=�<�;�:
�I 3
�H 
file
�G .coredoexbool        obj 
�F .rdwropenshor       file
�E .rdwrgeofcomp       ****
�D 
rdto
�C .rdwrread****        ****
�B .rdwrclosnull���     ****�A  �@  
�? 
psof�> 0 profile_version_prefix  
�= 
psin�< 
�; .sysooffslong    ��� null
�: 
ctxt�T ��E�OlE�O� }*�/j  n*�/j E�O �j E�O��l E�O�j W X 	 
�j O�O*���� E�O�j �[a \[Z��\Z���2E�OPY a O�Y a Uascr  ��ޭ