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
 l     ��������  ��  ��        l          p         ������ 0 firefox_profiles_path  ��    / )firefox profile folder's path (as string)     �   R f i r e f o x   p r o f i l e   f o l d e r ' s   p a t h   ( a s   s t r i n g )      l          p         ������ 0 install_bundle_name  ��    ' !name of the install bundle folder     �   B n a m e   o f   t h e   i n s t a l l   b u n d l e   f o l d e r      l          p         ������ 0 jondoprofile_foldername  ��    H B name of the JondoFox profile folder (within firefox_profile_path)     �     �   n a m e   o f   t h e   J o n d o F o x   p r o f i l e   f o l d e r   ( w i t h i n   f i r e f o x _ p r o f i l e _ p a t h )   ! " ! l      # $ % # p       & & ������ 0 profile_ini_backup_name  ��   $ 1 + name for the file profiles.ini backup file    % � ' ' V   n a m e   f o r   t h e   f i l e   p r o f i l e s . i n i   b a c k u p   f i l e "  ( ) ( l      * + , * p       - - ������ 0 jondofox_bookmarks_ff3  ��   + * $name of the bookmarksfile (FireFox3)    , � . . H n a m e   o f   t h e   b o o k m a r k s f i l e   ( F i r e F o x 3 ) )  / 0 / l      1 2 3 1 p       4 4 ������ 0 jondofox_bookmarks_ff2  ��   2 * $name of the bookmarksfile (FireFox2)    3 � 5 5 H n a m e   o f   t h e   b o o k m a r k s f i l e   ( F i r e F o x 2 ) 0  6 7 6 l      8 9 : 8 p       ; ; ������ 0 jondofox_bookmarks  ��   9 2 ,file handle for the users jondofox bookmarks    : � < < X f i l e   h a n d l e   f o r   t h e   u s e r s   j o n d o f o x   b o o k m a r k s 7  = > = l      ? @ A ? p       B B ������ 0 profiles_ini  ��   @  alias for profiles.ini    A � C C , a l i a s   f o r   p r o f i l e s . i n i >  D E D l     ��������  ��  ��   E  F G F i      H I H I     ������
�� .aevtoappnull  �   � ****��  ��   I k     � J J  K L K I    
�� M N
�� .sysodlogaskr        TEXT M m      O O � P P x T h i s   w i l l   a d d   t h e   J o n D o F o x   p r o f i l e   t o   y o u r   F i r e f o x   p r o f i l e s . N �� Q��
�� 
btns Q J     R R  S T S m     U U � V V  O K T  W�� W m     X X � Y Y  C a n c e l��  ��   L  Z [ Z Z     \ ]���� \ l    ^���� ^ =     _ ` _ n     a b a 1    ��
�� 
bhit b 1    ��
�� 
rslt ` m     c c � d d  C a n c e l��  ��   ] L     e e m    ����  ��  ��   [  f g f r     h i h m    ����   i o      ���� 0 err   g  j k j l   �� l m��   l #  initialize global variables	    m � n n :   i n i t i a l i z e   g l o b a l   v a r i a b l e s 	 k  o p o O   . q r q r   " - s t s b   " + u v u l  " ) w���� w l  " ) x���� x c   " ) y z y n   " ' { | { 1   % '��
�� 
ppth | 1   " %��
�� 
cusr z m   ' (��
�� 
TEXT��  ��  ��  ��   v m   ) * } } � ~ ~ H L i b r a r y : A p p l i c a t i o n   S u p p o r t : F i r e f o x : t o      ���� 0 firefox_profiles_path   r m      �                                                                                  sevs   alis    �  Macintosh HD               á$;H+    �System Events.app                                                q���H
        ����  	                CoreServices    á+      ��9�      �  �  �  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��   p  � � � r   / 4 � � � m   / 0 � � � � � ( J o n D o F o x _ I n s t a l l . a p p � o      ���� 0 install_bundle_name   �  � � � r   5 < � � � m   5 8 � � � � �  p r o f i l e � o      ���� 0 jondoprofile_foldername   �  � � � r   = D � � � m   = @ � � � � �   p r o f i l e s . i n i . b a k � o      ���� 0 profile_ini_backup_name   �  � � � r   E V � � � b   E R � � � b   E N � � � b   E J � � � o   E F���� 0 firefox_profiles_path   � m   F I � � � � �  P r o f i l e s : � o   J M���� 0 jondoprofile_foldername   � m   N Q � � � � �  : p l a c e s . s q l i t e � o      ���� 0 jondofox_bookmarks_ff3   �  � � � r   W h � � � b   W d � � � b   W ` � � � b   W \ � � � o   W X���� 0 firefox_profiles_path   � m   X [ � � � � �  P r o f i l e s : � o   \ _���� 0 jondoprofile_foldername   � m   ` c � � � � �  : b o o k m a r k s . h t m l � o      ���� 0 jondofox_bookmarks_ff2   �  � � � l  i i��������  ��  ��   �  � � � l  i i�� � ���   � T N We assume that if there are no saved settings of Firefox, it isn't installed.    � � � � �   W e   a s s u m e   t h a t   i f   t h e r e   a r e   n o   s a v e d   s e t t i n g s   o f   F i r e f o x ,   i t   i s n ' t   i n s t a l l e d . �  � � � Q   i � � � � � r   l y � � � c   l u � � � l  l q ����� � l  l q ����� � b   l q � � � o   l m���� 0 firefox_profiles_path   � m   m p � � � � �  p r o f i l e s . i n i��  ��  ��  ��   � m   q t��
�� 
alis � o      ���� 0 profiles_ini   � R      ������
�� .ascrerr ****      � ****��  ��   � k   � � � �  � � � I  � ��� � �
�� .sysodlogaskr        TEXT � m   � � � � � � � X S o r r y ,   b u t   y o u   d o n ' t   h a v e   F i r e f o x   i n s t a l l e d . � �� ���
�� 
btns � J   � � � �  ��� � m   � � � � � � �  O K��  ��   �  ��� � r   � � � � � m   � �����  � o      ���� 0 err  ��   �  � � � l  � ���������  ��  ��   �  � � � l  � ��� � ���   � 5 / main handler: first edit the profiles.ini ...     � � � � ^   m a i n   h a n d l e r :   f i r s t   e d i t   t h e   p r o f i l e s . i n i   . . .   �  � � � Z   � � � ����� � l  � � ����� � =   � � � � � o   � ����� 0 err   � m   � �����  ��  ��   � k   � � � �  � � � l  � ��� � ���   � R L if Firefox is running during the installation it may fail, so quit Firefox.    � � � � �   i f   F i r e f o x   i s   r u n n i n g   d u r i n g   t h e   i n s t a l l a t i o n   i t   m a y   f a i l ,   s o   q u i t   F i r e f o x . �  � � � O  � � � � � I  � �������
�� .aevtquitnull��� ��� null��  ��   � m   � � � ��                                                                                  MOZB   alis    P  Macintosh HD               á$;H+    ZFirefox.app                                                     1b��t;U        ����  	                Applications    á+      �t5      Z  %Macintosh HD:Applications:Firefox.app     F i r e f o x . a p p    M a c i n t o s h   H D  Applications/Firefox.app  / ��   �  ��� � r   � � � � � I   � ��������� 0 edit_profiles_ini  ��  ��   � o      ���� 0 err  ��  ��  ��   �  � � � l  � ��� � ���   � I C ... if successful: copy the folder containing the JonDoFox profile    � � � � �   . . .   i f   s u c c e s s f u l :   c o p y   t h e   f o l d e r   c o n t a i n i n g   t h e   J o n D o F o x   p r o f i l e �  � � � Z   � � � ����� � l  � � ����� � =   � � � � � o   � ����� 0 err   � m   � �����  ��  ��   � r   � � � � � I   � ��������� 0 copy_folder  ��  ��   � o      ���� 0 err  ��  ��   �  � � � l  � ��� � ��   � ( " installation procedure successful     � D   i n s t a l l a t i o n   p r o c e d u r e   s u c c e s s f u l �  Z   � ����� l  � ����� =   � � o   � ����� 0 err   m   � �����  ��  ��   I  � ���	

�� .sysodlogaskr        TEXT	 m   � � � N J o n D o F o x   p r o f i l e   s u c c e s s f u l l y   i n s t a l l e d
 ����
�� 
btns J   � � �� m   � � �  O K��  ��  ��  ��    l  � �����   $  installation procedure failed    � <   i n s t a l l a t i o n   p r o c e d u r e   f a i l e d  Z   � ����� l  � ����� =   � � o   � ����� 0 err   m   � ����� ��  ��   I  � ���
�� .sysodlogaskr        TEXT m   � �   �!! r A n   e r r o r   o c c u r e d .   J o n D o F o x   p r o f i l e   c o u l d   n o t   b e   i n s t a l l e d �"�~
� 
btns" J   � �## $�}$ m   � �%% �&&  O K�}  �~  ��  ��   '�|' L   � �(( o   � ��{�{ 0 err  �|   G )*) l     �z�y�x�z  �y  �x  * +,+ l     �w-.�w  - / ) appends JonDoFox profile to profiles.ini   . �// R   a p p e n d s   J o n D o F o x   p r o f i l e   t o   p r o f i l e s . i n i, 010 i    232 I      �v�u�t�v 0 edit_profiles_ini  �u  �t  3 k    44 565 l     �s78�s  7 # new entries for profiles.ini    8 �99 : n e w   e n t r i e s   f o r   p r o f i l e s . i n i  6 :;: r     <=< b     >?> b     @A@ m     BB �CC  [ G e n e r a l ]A o    �r
�r 
ret ? m    DD �EE , S t a r t W i t h L a s t P r o f i l e = 0= o      �q�q 0 profiles_ini_header  ; FGF r    HIH b    JKJ b    LML b    NON b    PQP b    RSR b    TUT o    	�p
�p 
ret U m   	 
VV �WW  N a m e = J o n D o F o xS o    �o
�o 
ret Q m    XX �YY  I s R e l a t i v e = 1O o    �n
�n 
ret M m    ZZ �[[  P a t h = P r o f i l e s /K o    �m�m 0 jondoprofile_foldername  I o      �l�l 0 jondofox_profile_entry  G \]\ l   �k�j�i�k  �j  �i  ] ^_^ l   �h�g�f�h  �g  �f  _ `a` l   �ebc�e  b u oread all the entries from the profile.ini to buf. (This will do because the file shouldn't be incredibly large)   c �dd � r e a d   a l l   t h e   e n t r i e s   f r o m   t h e   p r o f i l e . i n i   t o   b u f .   ( T h i s   w i l l   d o   b e c a u s e   t h e   f i l e   s h o u l d n ' t   b e   i n c r e d i b l y   l a r g e )a efe r    $ghg I   "�di�c
�d .rdwropenshor       filei 4    �bj
�b 
filej l   k�a�`k c    lml o    �_�_ 0 profiles_ini  m m    �^
�^ 
TEXT�a  �`  �c  h o      �]�] 0 profile_ini_fdr  f non Q   % [pqrp k   ( ;ss tut r   ( 5vwv I  ( 3�\xy
�\ .rdwrread****        ****x o   ( )�[�[ 0 profile_ini_fdr  y �Zz�Y
�Z 
rdtoz l  * /{�X�W{ I  * /�V|�U
�V .rdwrgeofcomp       ****| o   * +�T�T 0 profile_ini_fdr  �U  �X  �W  �Y  w o      �S�S 0 buf  u }�R} I  6 ;�Q~�P
�Q .rdwrclosnull���     ****~ o   6 7�O�O 0 profile_ini_fdr  �P  �R  q R      �N�M�L
�N .ascrerr ****      � ****�M  �L  r k   C [ ��� I  C H�K��J
�K .rdwrclosnull���     ****� o   C D�I�I 0 profile_ini_fdr  �J  � ��� I  I X�H��
�H .sysodlogaskr        TEXT� m   I L�� ��� P E r r o r :   c o u l d n ' t   r e a d   F i r e f o x   p r o f i l e . i n i� �G��F
�G 
btns� J   O T�� ��E� m   O R�� ���  O K�E  �F  � ��D� L   Y [�� m   Y Z�C�C �D  o ��� l  \ \�B�A�@�B  �A  �@  � ��� l  \ \�?���?  � ; 5 Detection of an already installed JonDoFox profile.    � ��� j   D e t e c t i o n   o f   a n   a l r e a d y   i n s t a l l e d   J o n D o F o x   p r o f i l e .  � ��� l  \ \�>���>  � Q K (Then replace it without messing up the profiles.ini with useless entries)   � ��� �   ( T h e n   r e p l a c e   i t   w i t h o u t   m e s s i n g   u p   t h e   p r o f i l e s . i n i   w i t h   u s e l e s s   e n t r i e s )� ��� Z   \ ����=�<� l  \ a��;�:� E  \ a��� o   \ ]�9�9 0 buf  � m   ] `�� ���  N a m e = J o n D o F o x�;  �:  � k   d ��� ��� I  d |�8��
�8 .sysodlogaskr        TEXT� b   d m��� b   d i��� m   d g�� ��� \ Y o u   h a v e   a l r e a d y   i n s t a l l e d   a   J o n D o F o x   p r o f i l e .� o   g h�7
�7 
ret � m   i l�� ��� v T o   r e p l a c e   i t   c l i c k   c o n t i n u e .   ( Y o u r   b o o k m a r k s   w i l l   b e   k e p t )� �6��5
�6 
btns� J   p x�� ��� m   p s�� ���  C o n t i n u e� ��4� m   s v�� ��� 
 A b o r t�4  �5  � ��3� Z   } ����2�� l  } ���1�0� =   } ���� n   } ���� 1   � ��/
�/ 
bhit� 1   } ��.
�. 
rslt� m   � ��� ���  C o n t i n u e�1  �0  � k   � ��� ��� I   � ��-�,�+�- 0 copy_bookmarks  �,  �+  � ��*� L   � ��� m   � ��)�)  �*  �2  � L   � ��� m   � ��(�( �3  �=  �<  � ��� l  � ��'�&�%�'  �&  �%  � ��� l  � ��$���$  � ) # saving old version of profiles.ini   � ��� F   s a v i n g   o l d   v e r s i o n   o f   p r o f i l e s . i n i� ��� I   � ��#�"�!�# 0 backup_profile_ini  �"  �!  � ��� l  � �� ���   �  �  � ��� l  � �����  �   modify profiles.ini   � ��� (   m o d i f y   p r o f i l e s . i n i� ��� r   � ���� b   � ���� b   � ���� b   � ���� o   � ��
� 
ret � o   � ��
� 
ret � I   � ����� 0 get_next_profile  � ��� o   � ��� 0 buf  �  �  � o   � ��� 0 jondofox_profile_entry  � o      �� 0 complete_entry  � ��� Q   ����� k   � ��� ��� r   � ���� I  � ����
� .rdwropenshor       file� 4   � ���
� 
alis� l  � ����� c   � ���� o   � ��� 0 profiles_ini  � m   � ��
� 
TEXT�  �  � ���
� 
perm� m   � ��
� boovtrue�  � o      �� 0 profile_ini_fdw  � ��� l  � ��
���
  � l frewriting the general header of profiles.ini will force Firefox to open the profile manager at startup   � ��� � r e w r i t i n g   t h e   g e n e r a l   h e a d e r   o f   p r o f i l e s . i n i   w i l l   f o r c e   F i r e f o x   t o   o p e n   t h e   p r o f i l e   m a n a g e r   a t   s t a r t u p� ��� I  � ��	 
�	 .rdwrwritnull���     ****  o   � ��� 0 profiles_ini_header   ��
� 
refn o   � ��� 0 profile_ini_fdw  �  �  l  � ���   ( " append the JonDoFox profile entry    � D   a p p e n d   t h e   J o n D o F o x   p r o f i l e   e n t r y 	 I  � ��

� .rdwrwritnull���     ****
 o   � ��� 0 complete_entry   �
� 
wrat l  � �� �� [   � � l  � ����� I  � �����
�� .rdwrgeofcomp       **** o   � ����� 0 profile_ini_fdw  ��  ��  ��   m   � ����� �   ��   ����
�� 
refn o   � ����� 0 profile_ini_fdw  ��  	 �� I  � �����
�� .rdwrclosnull���     **** o   � ����� 0 profile_ini_fdw  ��  ��  � R      ������
�� .ascrerr ****      � ****��  ��  � k   �  I  � �����
�� .rdwrclosnull���     **** o   � ����� 0 profile_ini_fdw  ��    I  �
��
�� .sysodlogaskr        TEXT m   � � � P E r r o r :   c o u l d n ' t   e d i t   F i r e f o x   p r o f i l e . i n i �� ��
�� 
btns  J  !! "��" m  ## �$$  O K��  ��   %&% l ��������  ��  ��  & '��' L  (( m  ���� ��  � )��) L  ** m  ����  ��  1 +,+ l     ��������  ��  ��  , -.- l     ��/0��  / J D copies the JonDoFox profile folder to the Firefox profile directory   0 �11 �   c o p i e s   t h e   J o n D o F o x   p r o f i l e   f o l d e r   t o   t h e   F i r e f o x   p r o f i l e   d i r e c t o r y. 232 i    454 I      �������� 0 copy_folder  ��  ��  5 k     N66 787 Q     K9:;9 O    +<=< k    *>> ?@? r    ABA b    CDC b    EFE l   G����G c    HIH l   J����J n    KLK m    ��
�� 
ctnrL l   M����M l   N����N I   ��O��
�� .earsffdralis        afdrO  f    ��  ��  ��  ��  ��  ��  ��  I m    ��
�� 
TEXT��  ��  F o    ���� 0 install_bundle_name  D m    PP �QQ ( : C o n t e n t s : R e s o u r c e s :B o      ���� 0 source_folder  @ R��R I   *��ST
�� .coreclon****      � ****S l   U����U c    VWV l   X����X b    YZY l   [����[ c    \]\ o    ���� 0 source_folder  ] m    ��
�� 
TEXT��  ��  Z o    ���� 0 jondoprofile_foldername  ��  ��  W m    ��
�� 
alis��  ��  T ��^_
�� 
insh^ l   $`����` c    $aba b    "cdc o     ���� 0 firefox_profiles_path  d m     !ee �ff  P r o f i l e s :b m   " #��
�� 
alis��  ��  _ ��g��
�� 
alrpg m   % &��
�� boovtrue��  ��  = m    hh�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  : R      ������
�� .ascrerr ****      � ****��  ��  ; k   3 Kii jkj l  3 3��lm��  l D >if something goes wrong: restore old settings from backup file   m �nn | i f   s o m e t h i n g   g o e s   w r o n g :   r e s t o r e   o l d   s e t t i n g s   f r o m   b a c k u p   f i l ek opo I   3 8�������� 0 restore_old_settings  ��  ��  p qrq I  9 H��st
�� .sysodlogaskr        TEXTs m   9 <uu �vv V E r r o r :   c o u l d n ' t   f i n d   F i r e f o x   p r o f i l e   f o l d e rt ��w��
�� 
btnsw J   ? Dxx y��y m   ? Bzz �{{  O K��  ��  r |��| L   I K}} m   I J���� ��  8 ~��~ L   L N m   L M����  ��  3 ��� l     ��������  ��  ��  � ��� l     ������  � 1 + find out the number of installed profiles    � ��� V   f i n d   o u t   t h e   n u m b e r   o f   i n s t a l l e d   p r o f i l e s  � ��� i    ��� I      ������� 0 get_next_profile  � ���� o      ���� 0 	prof_file  ��  ��  � k     -�� ��� r     ��� m     ��
�� boovtrue� o      ���� 0 not_reached  � ��� r    ��� m    ������� o      ���� 0 ctr  � ��� r    ��� m    	�� ���  � o      ���� 0 profile_header  � ��� V    *��� k    %�� ��� r    ��� l   ������ [    ��� o    ���� 0 ctr  � m    ���� ��  ��  � o      ���� 0 ctr  � ��� r    ��� b    ��� b    ��� m    �� ���  [ P r o f i l e� o    ���� 0 ctr  � m    �� ���  ]� o      ���� 0 profile_header  � ���� r     %��� l    #������ E    #��� o     !���� 0 	prof_file  � o   ! "���� 0 profile_header  ��  ��  � o      ���� 0 not_reached  ��  � o    ���� 0 not_reached  � ���� L   + -�� o   + ,���� 0 profile_header  ��  � ��� l     ��������  ��  ��  � ��� l     ������  � %  create a backup of profile.ini   � ��� >   c r e a t e   a   b a c k u p   o f   p r o f i l e . i n i� ��� i    ��� I      �������� 0 backup_profile_ini  ��  ��  � k     =�� ��� l     ������  � 	 try   � ���  t r y� ��� O     ;��� k    :�� ��� Z    &������� l   ������ I   ���~
� .coredoexbool        obj � l   
��}�|� 4    
�{�
�{ 
file� l   	��z�y� b    	��� o    �x�x 0 firefox_profiles_path  � o    �w�w 0 profile_ini_backup_name  �z  �y  �}  �|  �~  ��  ��  � k    "�� ��� I   �v��u
�v .coredeloobj        obj � c    ��� l   ��t�s� b    ��� o    �r�r 0 firefox_profiles_path  � o    �q�q 0 profile_ini_backup_name  �t  �s  � m    �p
�p 
alis�u  � ��o� I   "�n��m
�n .fndremptnull��� ��� obj � 1    �l
�l 
trsh�m  �o  ��  ��  � ��� r   ' 2��� l  ' 0��k�j� I  ' 0�i��
�i .coreclon****      � ****� o   ' (�h�h 0 profiles_ini  � �g��f
�g 
insh� l  ) ,��e�d� c   ) ,��� o   ) *�c�c 0 firefox_profiles_path  � m   * +�b
�b 
alis�e  �d  �f  �k  �j  � o      �a�a 0 backup_file  � ��`� r   3 :��� c   3 6��� o   3 4�_�_ 0 profile_ini_backup_name  � m   4 5�^
�^ 
utxt� n      ��� 1   7 9�]
�] 
pnam� o   6 7�\�\ 0 backup_file  �`  � m     ���                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  � ��� l  < <�[���[  �  on error   � ���  o n   e r r o r�    l  < <�Z�Z   | v	display dialog "Error occured while saving profiles.ini. This should never happen. Please report this" buttons {"OK"}    � � 	 d i s p l a y   d i a l o g   " E r r o r   o c c u r e d   w h i l e   s a v i n g   p r o f i l e s . i n i .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i s "   b u t t o n s   { " O K " } �Y l  < <�X�X    end try    �  e n d   t r y�Y  � 	
	 l     �W�V�U�W  �V  �U  
  l     �T�T   + %saves the existing jondofox bookmarks    � J s a v e s   t h e   e x i s t i n g   j o n d o f o x   b o o k m a r k s  i     I      �S�R�Q�S 0 copy_bookmarks  �R  �Q   O     ; k    :  Z    �P l   �O�N I   �M�L
�M .coredoexbool        obj  l   �K�J 4    �I
�I 
file o    �H�H 0 jondofox_bookmarks_ff3  �K  �J  �L  �O  �N   r     !  c    "#" o    �G�G 0 jondofox_bookmarks_ff3  # m    �F
�F 
alis! o      �E�E 0 jondofox_bookmarks_file  �P   r    $%$ c    &'& o    �D�D 0 jondofox_bookmarks_ff2  ' m    �C
�C 
alis% o      �B�B 0 jondofox_bookmarks_file   ()( r    0*+* c    .,-, l   ,.�A�@. b    ,/0/ b    *121 b    (343 l   &5�?�>5 c    &676 l   $8�=�<8 n    $9:9 m   " $�;
�; 
ctnr: l   ";�:�9; l   "<�8�7< I   "�6=�5
�6 .earsffdralis        afdr=  f    �5  �8  �7  �:  �9  �=  �<  7 m   $ %�4
�4 
TEXT�?  �>  4 o   & '�3�3 0 install_bundle_name  2 m   ( )>> �?? ( : C o n t e n t s : R e s o u r c e s :0 o   * +�2�2 0 jondoprofile_foldername  �A  �@  - m   , -�1
�1 
alis+ o      �0�0 0 source_folder  ) @�/@ I  1 :�.AB
�. .coremoveobj        obj A l  1 2C�-�,C o   1 2�+�+ 0 jondofox_bookmarks_file  �-  �,  B �*DE
�* 
inshD l  3 4F�)�(F o   3 4�'�' 0 source_folder  �)  �(  E �&G�%
�& 
alrpG m   5 6�$
�$ boovtrue�%  �/   m     HH�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��   IJI l     �#�"�!�#  �"  �!  J KLK l     � MN�   M Z T restore old settings in case the copy process of the JonDoFox profile folder fails    N �OO �   r e s t o r e   o l d   s e t t i n g s   i n   c a s e   t h e   c o p y   p r o c e s s   o f   t h e   J o n D o F o x   p r o f i l e   f o l d e r   f a i l s  L P�P i    QRQ I      ���� 0 restore_old_settings  �  �  R Q     JSTUS O    7VWV Z    6XY��X l   Z��Z I   �[�
� .coredoexbool        obj [ l   \��\ 4    �]
� 
file] l  	 ^��^ b   	 _`_ o   	 
�� 0 firefox_profiles_path  ` o   
 �� 0 profile_ini_backup_name  �  �  �  �  �  �  �  Y k    2aa bcb I   �d�
� .coredeloobj        obj d o    �� 0 profiles_ini  �  c efe I   !�g�

� .fndremptnull��� ��� obj g 1    �	
�	 
trsh�
  f hih r   " *jkj l  " (l��l 4   " (�m
� 
filem l  $ 'n��n b   $ 'opo o   $ %�� 0 firefox_profiles_path  p o   % &�� 0 profile_ini_backup_name  �  �  �  �  k o      �� 0 backup_file  i q� q r   + 2rsr c   + .tut m   + ,vv �ww  p r o f i l e s . i n iu m   , -��
�� 
utxts n      xyx 1   / 1��
�� 
pnamy o   . /���� 0 backup_file  �   �  �  W m    zz�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  T R      ������
�� .ascrerr ****      � ****��  ��  U I  ? J��{|
�� .sysodlogaskr        TEXT{ m   ? @}} �~~ � E r r o r   o c c u r e d   w h i l e   r e s t o r i n g   o l d   s e t t i n g s .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i s| ����
�� 
btns J   A F�� ���� m   A D�� ���  O K��  ��  �       	������������  � ��������������
�� .aevtoappnull  �   � ****�� 0 edit_profiles_ini  �� 0 copy_folder  �� 0 get_next_profile  �� 0 backup_profile_ini  �� 0 copy_bookmarks  �� 0 restore_old_settings  � �� I��������
�� .aevtoappnull  �   � ****��  ��  �  � * O�� U X������ c�� ������ }�� ��� ��� ��� � ��� � ��� ��������� � � ������� %
�� 
btns
�� .sysodlogaskr        TEXT
�� 
rslt
�� 
bhit�� 0 err  
�� 
cusr
�� 
ppth
�� 
TEXT�� 0 firefox_profiles_path  �� 0 install_bundle_name  �� 0 jondoprofile_foldername  �� 0 profile_ini_backup_name  �� 0 jondofox_bookmarks_ff3  �� 0 jondofox_bookmarks_ff2  
�� 
alis�� 0 profiles_ini  ��  ��  
�� .aevtquitnull��� ��� null�� 0 edit_profiles_ini  �� 0 copy_folder  �� �����lvl O��,�  jY hOjE�O� *�,�,�&�%E�UO�E` Oa E` Oa E` O�a %_ %a %E` O�a %_ %a %E` O �a %a &E` W X  a  �a !kvl OkE�O�j  a " *j #UO*j+ $E�Y hO�j  *j+ %E�Y hO�j  a &�a 'kvl Y hO�k  a (�a )kvl Y hO�� ��3���������� 0 edit_profiles_ini  ��  ��  � �������������� 0 profiles_ini_header  �� 0 jondofox_profile_entry  �� 0 profile_ini_fdr  �� 0 buf  �� 0 complete_entry  �� 0 profile_ini_fdw  � (B��DVXZ��������������������������������������������������������#
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
�� .sysodlogaskr        TEXT
�� 
rslt
�� 
bhit�� 0 copy_bookmarks  �� 0 backup_profile_ini  �� 0 get_next_profile  
�� 
alis
�� 
perm
�� 
refn
�� .rdwrwritnull���     ****
�� 
wrat�� ����%�%E�O��%�%�%�%�%�%E�O*���&/j 
E�O ��j l E�O�j W X  �j Oa a a kvl OkO�a  9a �%a %a a a lvl O_ a ,a   *j+ OjY kY hO*j+ O��%*�k+ %�%E�O =*a  ��&/a !el 
E�O�a "�l #O�a $�j ka "�a % #O�j W X  �j Oa &a a 'kvl OkOj� ��5���������� 0 copy_folder  ��  ��  � ���� 0 source_folder  � h��������P��������e������������u��z��
�� .earsffdralis        afdr
�� 
ctnr
�� 
TEXT�� 0 install_bundle_name  �� 0 jondoprofile_foldername  
�� 
alis
�� 
insh�� 0 firefox_profiles_path  
�� 
alrp�� 
�� .coreclon****      � ****��  ��  �� 0 restore_old_settings  
�� 
btns
�� .sysodlogaskr        TEXT�� O -� %)j �,�&�%�%E�O��&�%�&���%�&�e� UW X  *j+ Oa a a kvl OkOj� ������������� 0 get_next_profile  �� ����� �  ���� 0 	prof_file  ��  � ���������� 0 	prof_file  �� 0 not_reached  �� 0 ctr  �� 0 profile_header  � ����� .eE�OiE�O�E�O h��kE�O�%�%E�O��E�[OY��O�� ������������� 0 backup_profile_ini  ��  ��  � ���� 0 backup_file  � ���������������������������
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
�� 
pnam�� >� 8*���%/j  ��%�&j O*�,j Y hO����&l E�O��&��,FUOP� ����~���}�� 0 copy_bookmarks  �  �~  � �|�{�| 0 jondofox_bookmarks_file  �{ 0 source_folder  � H�z�y�x�w�v�u�t�s�r>�q�p�o�n�m
�z 
file�y 0 jondofox_bookmarks_ff3  
�x .coredoexbool        obj 
�w 
alis�v 0 jondofox_bookmarks_ff2  
�u .earsffdralis        afdr
�t 
ctnr
�s 
TEXT�r 0 install_bundle_name  �q 0 jondoprofile_foldername  
�p 
insh
�o 
alrp�n 
�m .coremoveobj        obj �} <� 8*��/j  
��&E�Y ��&E�O)j �,�&�%�%�%�&E�O���e� U� �lR�k�j���i�l 0 restore_old_settings  �k  �j  � �h�h 0 backup_file  � z�g�f�e�d�c�b�a�`v�_�^�]�\}�[��Z
�g 
file�f 0 firefox_profiles_path  �e 0 profile_ini_backup_name  
�d .coredoexbool        obj �c 0 profiles_ini  
�b .coredeloobj        obj 
�a 
trsh
�` .fndremptnull��� ��� obj 
�_ 
utxt
�^ 
pnam�]  �\  
�[ 
btns
�Z .sysodlogaskr        TEXT�i K 9� 1*���%/j  #�j O*�,j O*���%/E�O��&��,FY hUW X  ��a kvl  ascr  ��ޭ