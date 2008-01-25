FasdUAS 1.101.10   ��   ��    k             l      ��  ��    U O 
  JonDoFox profile installation script for Mac OS X
  2007 by Simon Pecher 
      � 	 	 �   
     J o n D o F o x   p r o f i l e   i n s t a l l a t i o n   s c r i p t   f o r   M a c   O S   X 
     2 0 0 7   b y   S i m o n   P e c h e r   
     
  
 l     ��������  ��  ��        l          p         ������ 0 firefox_profiles_path  ��    / )firefox profile folder's path (as string)     �   R f i r e f o x   p r o f i l e   f o l d e r ' s   p a t h   ( a s   s t r i n g )      l          p         ������ 0 install_bundle_name  ��    ' !nmae of the install bundle folder     �   B n m a e   o f   t h e   i n s t a l l   b u n d l e   f o l d e r      l          p         ������ 0 jondoprofile_foldername  ��    H B name of the JondoFox profile folder (within firefox_profile_path)     �     �   n a m e   o f   t h e   J o n d o F o x   p r o f i l e   f o l d e r   ( w i t h i n   f i r e f o x _ p r o f i l e _ p a t h )   ! " ! l      # $ % # p       & & ������ 0 profile_ini_backup_name  ��   $ 1 + name for the file profiles.ini backup file    % � ' ' V   n a m e   f o r   t h e   f i l e   p r o f i l e s . i n i   b a c k u p   f i l e "  ( ) ( l      * + , * p       - - ������ 0 profiles_ini  ��   +  alias for profiles.ini    , � . . , a l i a s   f o r   p r o f i l e s . i n i )  / 0 / l     ��������  ��  ��   0  1 2 1 i      3 4 3 I     ������
�� .aevtoappnull  �   � ****��  ��   4 k     � 5 5  6 7 6 I    
�� 8 9
�� .sysodlogaskr        TEXT 8 m      : : � ; ; x T h i s   w i l l   a d d   t h e   J o n D o F o x   p r o f i l e   t o   y o u r   F i r e f o x   p r o f i l e s . 9 �� <��
�� 
btns < J     = =  > ? > m     @ @ � A A  O K ?  B�� B m     C C � D D  C a n c e l��  ��   7  E F E Z     G H���� G l    I���� I =     J K J n     L M L 1    ��
�� 
bhit M 1    ��
�� 
rslt K m     N N � O O  C a n c e l��  ��   H L     P P m    ����  ��  ��   F  Q R Q r     S T S m    ����   T o      ���� 0 err   R  U V U l   �� W X��   W #  initialize global variables	    X � Y Y :   i n i t i a l i z e   g l o b a l   v a r i a b l e s 	 V  Z [ Z O   . \ ] \ r   " - ^ _ ^ b   " + ` a ` l  " ) b���� b l  " ) c���� c c   " ) d e d n   " ' f g f 1   % '��
�� 
ppth g 1   " %��
�� 
cusr e m   ' (��
�� 
TEXT��  ��  ��  ��   a m   ) * h h � i i H L i b r a r y : A p p l i c a t i o n   S u p p o r t : F i r e f o x : _ o      ���� 0 firefox_profiles_path   ] m     j j�                                                                                  sevs   alis    �  Macintosh HD               á$;H+    �System Events.app                                                q���H
        ����  	                CoreServices    á+      ��9�      �  �  �  :Macintosh HD:System:Library:CoreServices:System Events.app  $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��   [  k l k r   / 4 m n m m   / 0 o o � p p ( J o n D o F o x _ I n s t a l l . a p p n o      ���� 0 install_bundle_name   l  q r q r   5 < s t s m   5 8 u u � v v  p r o f i l e t o      ���� 0 jondoprofile_foldername   r  w x w r   = D y z y m   = @ { { � | |   p r o f i l e s . i n i . b a k z o      ���� 0 profile_ini_backup_name   x  } ~ } l  E E��  ���    T N We assume that if there are no saved settings of Firefox, it isn't installed.    � � � � �   W e   a s s u m e   t h a t   i f   t h e r e   a r e   n o   s a v e d   s e t t i n g s   o f   F i r e f o x ,   i t   i s n ' t   i n s t a l l e d . ~  � � � Q   E n � � � � r   H U � � � c   H Q � � � l  H M ����� � l  H M ����� � b   H M � � � o   H I���� 0 firefox_profiles_path   � m   I L � � � � �  p r o f i l e s . i n i��  ��  ��  ��   � m   M P��
�� 
alis � o      ���� 0 profiles_ini   � R      ������
�� .ascrerr ****      � ****��  ��   � k   ] n � �  � � � I  ] j�� � �
�� .sysodlogaskr        TEXT � m   ] ` � � � � � X S o r r y ,   b u t   y o u   d o n ' t   h a v e   F i r e f o x   i n s t a l l e d . � �� ���
�� 
btns � J   a f � �  ��� � m   a d � � � � �  O K��  ��   �  ��� � r   k n � � � m   k l����  � o      ���� 0 err  ��   �  � � � l  o o��������  ��  ��   �  � � � l  o o�� � ���   � 5 / main handler: first edit the profiles.ini ...     � � � � ^   m a i n   h a n d l e r :   f i r s t   e d i t   t h e   p r o f i l e s . i n i   . . .   �  � � � Z   o � � ����� � l  o r ����� � =   o r � � � o   o p���� 0 err   � m   p q����  ��  ��   � k   u � � �  � � � l  u u�� � ���   � R L if Firefox is running during the installation it may fail, so quit Firefox.    � � � � �   i f   F i r e f o x   i s   r u n n i n g   d u r i n g   t h e   i n s t a l l a t i o n   i t   m a y   f a i l ,   s o   q u i t   F i r e f o x . �  � � � O  u � � � � I  { �������
�� .aevtquitnull��� ��� null��  ��   � m   u x � ��                                                                                  MOZB   alis    P  Macintosh HD               á$;H+    ZFirefox.app                                                     ��r��        ����  	                Applications    á+      �r��      Z  %Macintosh HD:Applications:Firefox.app     F i r e f o x . a p p    M a c i n t o s h   H D  Applications/Firefox.app  / ��   �  ��� � r   � � � � � I   � ��������� 0 edit_profiles_ini  ��  ��   � o      ���� 0 err  ��  ��  ��   �  � � � l  � ��� � ���   � I C ... if successful: copy the folder containing the JonDoFox profile    � � � � �   . . .   i f   s u c c e s s f u l :   c o p y   t h e   f o l d e r   c o n t a i n i n g   t h e   J o n D o F o x   p r o f i l e �  � � � Z   � � � ����� � l  � � ����� � =   � � � � � o   � ����� 0 err   � m   � �����  ��  ��   � r   � � � � � I   � ��������� 0 copy_folder  ��  ��   � o      ���� 0 err  ��  ��   �  � � � l  � ��� � ���   � ( " installation procedure successful    � � � � D   i n s t a l l a t i o n   p r o c e d u r e   s u c c e s s f u l �  � � � Z   � � � ����� � l  � � ����� � =   � � � � � o   � ����� 0 err   � m   � �����  ��  ��   � I  � ��� � �
�� .sysodlogaskr        TEXT � m   � � � � � � � N J o n D o F o x   p r o f i l e   s u c c e s s f u l l y   i n s t a l l e d � �� ���
�� 
btns � J   � � � �  ��� � m   � � � � � � �  O K��  ��  ��  ��   �  � � � l  � ��� � ���   � $  installation procedure failed    � � � � <   i n s t a l l a t i o n   p r o c e d u r e   f a i l e d �  � � � Z   � � � ����� � l  � � ����� � =   � � � � � o   � ����� 0 err   � m   � ����� ��  ��   � I  � ��� � �
�� .sysodlogaskr        TEXT � m   � � � � � � � r A n   e r r o r   o c c u r e d .   J o n D o F o x   p r o f i l e   c o u l d   n o t   b e   i n s t a l l e d � �� ���
�� 
btns � J   � � � �  ��� � m   � � � � � � �  O K��  ��  ��  ��   �  ��� � L   � � � � o   � ����� 0 err  ��   2  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � / ) appends JonDoFox profile to profiles.ini    � � � � R   a p p e n d s   J o n D o F o x   p r o f i l e   t o   p r o f i l e s . i n i �  � � � i     �  � I      �������� 0 edit_profiles_ini  ��  ��    k    
  l     ����   # new entries for profiles.ini     � : n e w   e n t r i e s   f o r   p r o f i l e s . i n i    r     	
	 b      b      m      �  [ G e n e r a l ] o    ��
�� 
ret  m     � , S t a r t W i t h L a s t P r o f i l e = 0
 o      ���� 0 profiles_ini_header    r     b     b     b     b     b      b    !"! o    	�
� 
ret " m   	 
## �$$  N a m e = J o n D o F o x  o    �~
�~ 
ret  m    %% �&&  I s R e l a t i v e = 1 o    �}
�} 
ret  m    '' �((  P a t h = P r o f i l e s / o    �|�| 0 jondoprofile_foldername   o      �{�{ 0 jondofox_profile_entry   )*) l   �z�y�x�z  �y  �x  * +,+ l   �w�v�u�w  �v  �u  , -.- l   �t/0�t  / u oread all the entries from the profile.ini to buf. (This will do because the file shouldn't be incredibly large)   0 �11 � r e a d   a l l   t h e   e n t r i e s   f r o m   t h e   p r o f i l e . i n i   t o   b u f .   ( T h i s   w i l l   d o   b e c a u s e   t h e   f i l e   s h o u l d n ' t   b e   i n c r e d i b l y   l a r g e ). 232 r    $454 I   "�s6�r
�s .rdwropenshor       file6 4    �q7
�q 
file7 l   8�p�o8 c    9:9 o    �n�n 0 profiles_ini  : m    �m
�m 
TEXT�p  �o  �r  5 o      �l�l 0 profile_ini_fdr  3 ;<; Q   % [=>?= k   ( ;@@ ABA r   ( 5CDC I  ( 3�kEF
�k .rdwrread****        ****E o   ( )�j�j 0 profile_ini_fdr  F �iG�h
�i 
rdtoG l  * /H�g�fH I  * /�eI�d
�e .rdwrgeofcomp       ****I o   * +�c�c 0 profile_ini_fdr  �d  �g  �f  �h  D o      �b�b 0 buf  B J�aJ I  6 ;�`K�_
�` .rdwrclosnull���     ****K o   6 7�^�^ 0 profile_ini_fdr  �_  �a  > R      �]�\�[
�] .ascrerr ****      � ****�\  �[  ? k   C [LL MNM I  C H�ZO�Y
�Z .rdwrclosnull���     ****O o   C D�X�X 0 profile_ini_fdr  �Y  N PQP I  I X�WRS
�W .sysodlogaskr        TEXTR m   I LTT �UU P E r r o r :   c o u l d n ' t   r e a d   F i r e f o x   p r o f i l e . i n iS �VV�U
�V 
btnsV J   O TWW X�TX m   O RYY �ZZ  O K�T  �U  Q [�S[ L   Y [\\ m   Y Z�R�R �S  < ]^] l  \ \�Q�P�O�Q  �P  �O  ^ _`_ l  \ \�Nab�N  a ; 5 Detection of an already installed JonDoFox profile.    b �cc j   D e t e c t i o n   o f   a n   a l r e a d y   i n s t a l l e d   J o n D o F o x   p r o f i l e .  ` ded l  \ \�Mfg�M  f Q K (Then replace it without messing up the profiles.ini with useless entries)   g �hh �   ( T h e n   r e p l a c e   i t   w i t h o u t   m e s s i n g   u p   t h e   p r o f i l e s . i n i   w i t h   u s e l e s s   e n t r i e s )e iji Z   \ �kl�L�Kk l  \ am�J�Im E  \ anon o   \ ]�H�H 0 buf  o m   ] `pp �qq  N a m e = J o n D o F o x�J  �I  l k   d �rr sts I  d |�Guv
�G .sysodlogaskr        TEXTu b   d mwxw b   d iyzy m   d g{{ �|| \ Y o u   h a v e   a l r e a d y   i n s t a l l e d   a   J o n D o F o x   p r o f i l e .z o   g h�F
�F 
ret x m   i l}} �~~ F I f   y o u   c o n t i n u e   i t   w i l l   b e   r e p l a c e dv �E�D
�E 
btns J   p x�� ��� m   p s�� ���  C o n t i n u e� ��C� m   s v�� ��� 
 A b o r t�C  �D  t ��B� Z   } ����A�� l  } ���@�?� =   } ���� n   } ���� 1   � ��>
�> 
bhit� 1   } ��=
�= 
rslt� m   � ��� ���  C o n t i n u e�@  �?  � L   � ��� m   � ��<�<  �A  � L   � ��� m   � ��;�; �B  �L  �K  j ��� l  � ��:�9�8�:  �9  �8  � ��� l  � ��7���7  � ) # saving old version of profiles.ini   � ��� F   s a v i n g   o l d   v e r s i o n   o f   p r o f i l e s . i n i� ��� I   � ��6�5�4�6 0 backup_profile_ini  �5  �4  � ��� l  � ��3�2�1�3  �2  �1  � ��� l  � ��0���0  �   modify profiles.ini   � ��� (   m o d i f y   p r o f i l e s . i n i� ��� r   � ���� b   � ���� b   � ���� b   � ���� o   � ��/
�/ 
ret � o   � ��.
�. 
ret � I   � ��-��,�- 0 get_next_profile  � ��+� o   � ��*�* 0 buf  �+  �,  � o   � ��)�) 0 jondofox_profile_entry  � o      �(�( 0 complete_entry  � ��� Q   ����� k   � ��� ��� r   � ���� I  � ��'��
�' .rdwropenshor       file� 4   � ��&�
�& 
alis� l  � ���%�$� c   � ���� o   � ��#�# 0 profiles_ini  � m   � ��"
�" 
TEXT�%  �$  � �!�� 
�! 
perm� m   � ��
� boovtrue�   � o      �� 0 profile_ini_fdw  � ��� l  � �����  � l frewriting the general header of profiles.ini will force Firefox to open the profile manager at startup   � ��� � r e w r i t i n g   t h e   g e n e r a l   h e a d e r   o f   p r o f i l e s . i n i   w i l l   f o r c e   F i r e f o x   t o   o p e n   t h e   p r o f i l e   m a n a g e r   a t   s t a r t u p� ��� I  � ����
� .rdwrwritnull���     ****� o   � ��� 0 profiles_ini_header  � ���
� 
refn� o   � ��� 0 profile_ini_fdw  �  � ��� l  � �����  � ( " append the JonDoFox profile entry   � ��� D   a p p e n d   t h e   J o n D o F o x   p r o f i l e   e n t r y� ��� I  � ����
� .rdwrwritnull���     ****� o   � ��� 0 complete_entry  � ���
� 
wrat� l  � ����� [   � ���� l  � ����� I  � ����
� .rdwrgeofcomp       ****� o   � ��� 0 profile_ini_fdw  �  �  �  � m   � ��� �  �  � ���

� 
refn� o   � ��	�	 0 profile_ini_fdw  �
  � ��� I  � ����
� .rdwrclosnull���     ****� o   � ��� 0 profile_ini_fdw  �  �  � R      ���
� .ascrerr ****      � ****�  �  � k   ��� ��� I  � ���� 
� .rdwrclosnull���     ****� o   � ����� 0 profile_ini_fdw  �   � ��� I  �����
�� .sysodlogaskr        TEXT� m   � ��� ��� P E r r o r :   c o u l d n ' t   e d i t   F i r e f o x   p r o f i l e . i n i� �����
�� 
btns� J   � �� ���� m   � ��� ���  O K��  ��  � ��� l ��������  ��  ��  � ���� L  �� m  ���� ��  � ���� L  
�� m  	����  ��   � ��� l     ��������  ��  ��  � ��� l     ������  � J D copies the JonDoFox profile folder to the Firefox profile directory   � ��� �   c o p i e s   t h e   J o n D o F o x   p r o f i l e   f o l d e r   t o   t h e   F i r e f o x   p r o f i l e   d i r e c t o r y� ��� i    ��� I      �������� 0 copy_folder  ��  ��  � k     N��    Q     K O    + k    * 	 r    

 b     b     l   ���� c     l   ���� n     m    ��
�� 
ctnr l   ���� l   ���� I   ����
�� .earsffdralis        afdr  f    ��  ��  ��  ��  ��  ��  ��   m    ��
�� 
TEXT��  ��   o    ���� 0 install_bundle_name   m     � ( : C o n t e n t s : R e s o u r c e s : o      ���� 0 source_folder  	 �� I   *��
�� .coreclon****      � **** l   ���� c      l   !����! b    "#" l   $����$ c    %&% o    ���� 0 source_folder  & m    ��
�� 
TEXT��  ��  # o    ���� 0 jondoprofile_foldername  ��  ��    m    ��
�� 
alis��  ��   ��'(
�� 
insh' l   $)����) c    $*+* b    ",-, o     ���� 0 firefox_profiles_path  - m     !.. �//  P r o f i l e s :+ m   " #��
�� 
alis��  ��  ( ��0��
�� 
alrp0 m   % &��
�� boovtrue��  ��   m    11�                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��   R      ������
�� .ascrerr ****      � ****��  ��   k   3 K22 343 l  3 3��56��  5 D >if something goes wrong: restore old settings from backup file   6 �77 | i f   s o m e t h i n g   g o e s   w r o n g :   r e s t o r e   o l d   s e t t i n g s   f r o m   b a c k u p   f i l e4 898 I   3 8�������� 0 restore_old_settings  ��  ��  9 :;: I  9 H��<=
�� .sysodlogaskr        TEXT< m   9 <>> �?? V E r r o r :   c o u l d n ' t   f i n d   F i r e f o x   p r o f i l e   f o l d e r= ��@��
�� 
btns@ J   ? DAA B��B m   ? BCC �DD  O K��  ��  ; E��E L   I KFF m   I J���� ��   G��G L   L NHH m   L M����  ��  � IJI l     ��������  ��  ��  J KLK l     ��MN��  M 1 + find out the number of installed profiles    N �OO V   f i n d   o u t   t h e   n u m b e r   o f   i n s t a l l e d   p r o f i l e s  L PQP i    RSR I      ��T���� 0 get_next_profile  T U��U o      ���� 0 	prof_file  ��  ��  S k     -VV WXW r     YZY m     ��
�� boovtrueZ o      ���� 0 not_reached  X [\[ r    ]^] m    ������^ o      ���� 0 ctr  \ _`_ r    aba m    	cc �dd  b o      ���� 0 profile_header  ` efe V    *ghg k    %ii jkj r    lml l   n����n [    opo o    ���� 0 ctr  p m    ���� ��  ��  m o      ���� 0 ctr  k qrq r    sts b    uvu b    wxw m    yy �zz  [ P r o f i l ex o    ���� 0 ctr  v m    {{ �||  ]t o      ���� 0 profile_header  r }��} r     %~~ l    #������ E    #��� o     !���� 0 	prof_file  � o   ! "���� 0 profile_header  ��  ��   o      ���� 0 not_reached  ��  h o    ���� 0 not_reached  f ���� L   + -�� o   + ,���� 0 profile_header  ��  Q ��� l     ��������  ��  ��  � ��� l     ������  � %  create a backup of profile.ini   � ��� >   c r e a t e   a   b a c k u p   o f   p r o f i l e . i n i� ��� i    ��� I      �������� 0 backup_profile_ini  ��  ��  � Q     U���� O    >��� k    =�� ��� Z    )������� l   ������ I   �����
�� .coredoexbool        obj � l   ������ 4    ���
�� 
file� l  	 ������ b   	 ��� o   	 
���� 0 firefox_profiles_path  � o   
 ���� 0 profile_ini_backup_name  ��  ��  ��  ��  ��  ��  ��  � k    %�� ��� I   �����
�� .coredeloobj        obj � c    ��� l   ������ b    ��� o    ���� 0 firefox_profiles_path  � o    ���� 0 profile_ini_backup_name  ��  ��  � m    ��
�� 
alis��  � ���� I   %�����
�� .fndremptnull��� ��� obj � 1    !��
�� 
trsh��  ��  ��  ��  � ��� r   * 5��� l  * 3���~� I  * 3�}��
�} .coreclon****      � ****� o   * +�|�| 0 profiles_ini  � �{��z
�{ 
insh� l  , /��y�x� c   , /��� o   , -�w�w 0 firefox_profiles_path  � m   - .�v
�v 
alis�y  �x  �z  �  �~  � o      �u�u 0 backup_file  � ��t� r   6 =��� c   6 9��� o   6 7�s�s 0 profile_ini_backup_name  � m   7 8�r
�r 
utxt� n      ��� 1   : <�q
�q 
pnam� o   9 :�p�p 0 backup_file  �t  � m    ���                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  � R      �o�n�m
�o .ascrerr ****      � ****�n  �m  � I  F U�l��
�l .sysodlogaskr        TEXT� m   F I�� ��� � E r r o r   o c c u r e d   w h i l e   s a v i n g   p r o f i l e s . i n i .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i s� �k��j
�k 
btns� J   L Q�� ��i� m   L O�� ���  O K�i  �j  � ��� l     �h�g�f�h  �g  �f  � ��� l     �e���e  � Z T restore old settings in case the copy process of the JonDoFox profile folder fails    � ��� �   r e s t o r e   o l d   s e t t i n g s   i n   c a s e   t h e   c o p y   p r o c e s s   o f   t h e   J o n D o F o x   p r o f i l e   f o l d e r   f a i l s  � ��d� i    ��� I      �c�b�a�c 0 restore_old_settings  �b  �a  � Q     J���� O    7��� Z    6���`�_� l   ��^�]� I   �\��[
�\ .coredoexbool        obj � l   ��Z�Y� 4    �X�
�X 
file� l  	 ��W�V� b   	 ��� o   	 
�U�U 0 firefox_profiles_path  � o   
 �T�T 0 profile_ini_backup_name  �W  �V  �Z  �Y  �[  �^  �]  � k    2�� ��� I   �S��R
�S .coredeloobj        obj � o    �Q�Q 0 profiles_ini  �R  � ��� I   !�P��O
�P .fndremptnull��� ��� obj � 1    �N
�N 
trsh�O  � ��� r   " *��� l  " (��M�L� 4   " (�K�
�K 
file� l  $ '��J�I� b   $ '��� o   $ %�H�H 0 firefox_profiles_path  � o   % &�G�G 0 profile_ini_backup_name  �J  �I  �M  �L  � o      �F�F 0 backup_file  � ��E� r   + 2��� c   + .��� m   + ,�� ���  p r o f i l e s . i n i� m   , -�D
�D 
utxt� n      ��� 1   / 1�C
�C 
pnam� o   . /�B�B 0 backup_file  �E  �`  �_  � m    ���                                                                                  MACS   alis    r  Macintosh HD               á$;H+    �
Finder.app                                                       G���5r        ����  	                CoreServices    á+      ��'b      �  �  �  3Macintosh HD:System:Library:CoreServices:Finder.app    
 F i n d e r . a p p    M a c i n t o s h   H D  &System/Library/CoreServices/Finder.app  / ��  � R      �A�@�?
�A .ascrerr ****      � ****�@  �?  � I  ? J�>��
�> .sysodlogaskr        TEXT� m   ? @�� ��� � E r r o r   o c c u r e d   w h i l e   r e s t o r i n g   o l d   s e t t i n g s .   T h i s   s h o u l d   n e v e r   h a p p e n .   P l e a s e   r e p o r t   t h i s� �=��<
�= 
btns� J   A F��  �;  m   A D �  O K�;  �<  �d       �:	�:   �9�8�7�6�5�4
�9 .aevtoappnull  �   � ****�8 0 edit_profiles_ini  �7 0 copy_folder  �6 0 get_next_profile  �5 0 backup_profile_ini  �4 0 restore_old_settings   �3 4�2�1
�0
�3 .aevtoappnull  �   � ****�2  �1  
   $ :�/ @ C�.�-�, N�+ j�*�)�( h�' o�& u�% {�$ ��#�"�!�  � � ���� � � � �
�/ 
btns
�. .sysodlogaskr        TEXT
�- 
rslt
�, 
bhit�+ 0 err  
�* 
cusr
�) 
ppth
�( 
TEXT�' 0 firefox_profiles_path  �& 0 install_bundle_name  �% 0 jondoprofile_foldername  �$ 0 profile_ini_backup_name  
�# 
alis�" 0 profiles_ini  �!  �   
� .aevtquitnull��� ��� null� 0 edit_profiles_ini  � 0 copy_folder  �0 �����lvl O��,�  jY hOjE�O� *�,�,�&�%E�UO�E` Oa E` Oa E` O �a %a &E` W X  a �a kvl OkE�O�j  a  *j UO*j+ E�Y hO�j  *j+ E�Y hO�j  a  �a !kvl Y hO�k  a "�a #kvl Y hO� � ���� 0 edit_profiles_ini  �  �   ������� 0 profiles_ini_header  � 0 jondofox_profile_entry  � 0 profile_ini_fdr  � 0 buf  � 0 complete_entry  � 0 profile_ini_fdw   '�#%'��������
�	��T�Y�p{}�������� ������������
� 
ret � 0 jondoprofile_foldername  
� 
file� 0 profiles_ini  
� 
TEXT
� .rdwropenshor       file
� 
rdto
� .rdwrgeofcomp       ****
�
 .rdwrread****        ****
�	 .rdwrclosnull���     ****�  �  
� 
btns
� .sysodlogaskr        TEXT
� 
rslt
� 
bhit� 0 backup_profile_ini  � 0 get_next_profile  
�  
alis
�� 
perm
�� 
refn
�� .rdwrwritnull���     ****
�� 
wrat�� ���%�%E�O��%�%�%�%�%�%E�O*���&/j 
E�O ��j l E�O�j W X  �j Oa a a kvl OkO�a  3a �%a %a a a lvl O_ a ,a   jY kY hO*j+ O��%*�k+ %�%E�O =*a ��&/a  el 
E�O�a !�l "O�a #�j ka !�a $ "O�j W X  �j Oa %a a &kvl OkOj ����������� 0 copy_folder  ��  ��   ���� 0 source_folder   1����������������.������������>��C��
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
�� .sysodlogaskr        TEXT�� O -� %)j �,�&�%�%E�O��&�%�&���%�&�e� UW X  *j+ Oa a a kvl OkOj ��S�������� 0 get_next_profile  �� ����   ���� 0 	prof_file  ��   ���������� 0 	prof_file  �� 0 not_reached  �� 0 ctr  �� 0 profile_header   cy{�� .eE�OiE�O�E�O h��kE�O�%�%E�O��E�[OY��O� ����������� 0 backup_profile_ini  ��  ��   ���� 0 backup_file   �������������������������������������
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
pnam��  ��  
�� 
btns
�� .sysodlogaskr        TEXT�� V @� 8*���%/j  ��%�&j O*�,j Y hO����&l E�O��&��,FUW X  a a a kvl 	 ����������� 0 restore_old_settings  ��  ��   ���� 0 backup_file   �������������������������������
�� 
file�� 0 firefox_profiles_path  �� 0 profile_ini_backup_name  
�� .coredoexbool        obj �� 0 profiles_ini  
�� .coredeloobj        obj 
�� 
trsh
�� .fndremptnull��� ��� obj 
�� 
utxt
�� 
pnam��  ��  
�� 
btns
�� .sysodlogaskr        TEXT�� K 9� 1*���%/j  #�j O*�,j O*���%/E�O��&��,FY hUW X  ��a kvl  ascr  ��ޭ